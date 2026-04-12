# IMPLEMENTATION & WORKFLOW DOCUMENTATION
### Home Food Ordering System — Technical Flow Reference

---

## 1. System Architecture Overview

```
┌──────────────────────┐      HTTP/REST      ┌─────────────────────────┐
│  Customer Website    │ ◄──────────────────► │   Node.js + Express     │
│  (React / Vite)      │                      │   Backend (port 5000)   │
└──────────────────────┘                      │                         │
                                              │  Firebase Firestore DB  │
┌──────────────────────┐      HTTP/REST       │                         │
│  Cook Dashboard      │ ◄──────────────────► │  WhatsApp Webhook       │
│  (React / Vite)      │                      │  (/webhook)             │
└──────────────────────┘                      └─────────────────────────┘
                                                         ▲
                                              Meta WhatsApp Business API
                                                         │
                                              ┌──────────┴──────────┐
                                              │  WhatsApp User      │
                                              └─────────────────────┘
```

All three sub-systems share one backend. The Customer and Cook frontends communicate via the same REST API. The WhatsApp bot interacts with the same Firestore database.

---

## 2. Customer Website — Step-by-Step Workflow

### Step 1: App Load
- `App.jsx` initializes with view state `'home'`
- Reads `theme` from `localStorage` and applies dark/light mode to `<html>`
- Navbar renders with cart count (0 initially)
- `KitchenStatusBanner` on Home page fetches `GET /kitchen/status` to show current kitchen load and ETA

### Step 2: Browsing the Menu
- User navigates to **Menu** tab
- `Menu.jsx` calls `getMenu()` (→ `GET /menu`) on mount
- `setInterval` re-fetches menu every **15 seconds** to reflect real-time availability changes
- Items are filtered by selected category tab and by search query (both applied client-side over the full dataset)
- `MenuItemCard.jsx` renders each item with an "Add to Cart" button and quantity stepper

### Step 3: Cart Management
- `addToCart(item)` in `App.jsx` merges item into the `cart` state array (or increments quantity if already present)
- A **toast** ("Item added to cart") appears via `showToast()`
- The **CartDrawer** (slide-out panel) is opened by clicking the floating cart button or Navbar icon
- `updateQuantity(id, delta)` adjusts quantities; items reaching 0 are auto-removed
- CartDrawer renders current `cart` array with live totals

### Step 4: Checkout
- User clicks "Proceed to Checkout" in CartDrawer → `setView('checkout')`
- `Checkout.jsx` reads profile from `localStorage`
- If profile is complete and city is supported:
  - Renders order summary, delivery address, special instructions
- User clicks **"Proceed to Payment →"**
- `handleSubmit()` in `Checkout.jsx`:
  1. Builds `payload` object: `{ customerName, phone, address, items, totalAmount, specialInstructions }`
  2. Saves payload to `localStorage` as `pendingOrderPayload`
  3. After 400ms (brief UX delay), calls `setView('payment')`

### Step 5: Payment
- `Payment.jsx` loads on mount, reads `pendingOrderPayload` from `localStorage`
- If localStorage is empty (direct access), redirects to `'home'`
- User sees 3 payment method cards; UPI is selected by default
- User selects method (UPI or Card) → method card highlights visually
- User clicks **"Confirm & Place Order"**
- `handlePayNow()` executes:
  1. Sets `isProcessing = true` (button disabled)
  2. Sends `POST http://localhost:5000/order` with payload structured as `{ customer: { name, phone, address }, items, totalPrice }`
  3. **On success**: extracts `orderId` from response, calls `finalizeOrder(orderId)`
  4. **On failure (catch)**: generates fallback ID `ORD + timestamp` and calls `finalizeOrder(fallbackId)`
- `finalizeOrder()`:
  1. Saves `orderId` to `localStorage`
  2. Clears `pendingOrderPayload` from `localStorage`
  3. Prepends order to `userOrders` array in `localStorage`
  4. Calls `clearCart()` (empties React cart state)
  5. Sets `isSuccess = true` → renders success screen

### Step 6: Order Success Screen
- Shows "Payment Successful ✅" with `orderId` (copyable via clipboard)
- Two buttons:
  - "Back to Menu" → `setView('home')`
  - "Track Delivery Now" → `setView('track')`

### Step 7: Order Tracking
- `TrackOrder.jsx` loads
- `useEffect` reads `orderId` from `localStorage` and auto-fills the search field
- Second `useEffect` (triggered when `orderId` is set) starts **polling loop**:
  - Calls `GET http://localhost:5000/orders/:id` every **5 seconds**
  - On success: updates `orderDetails` state → UI re-renders
  - On error: silently ignored (poll retries next cycle)
- Timeline renders progress based on `STAGES.indexOf(status)`:
  - `pending → preparing → ready → out_for_delivery → delivered`
- When status = `out_for_delivery` or `delivered`:
  - **Delivery partner card** appears with deterministic mock partner (derived from orderId hash)
  - Shows name, phone, ETA (or "Delivered" badge)

---

## 3. Cook Website — Step-by-Step Workflow

### Step 1: Dashboard Load
- `Dashboard.jsx` calls `Promise.allSettled()` on 5 concurrent API requests:
  1. `GET /orders` — all orders
  2. `GET /kitchen/status` — kitchen load level
  3. `GET /analytics/summary` — revenue summary
  4. `GET /analytics/status` — order counts by status
  5. `GET /analytics/low-stock` — low stock ingredients
- Each request has a fulfilled/rejected fallback — dashboard never crashes if one API fails
- Summary KPI cards are computed client-side from orders if analytics API returns nothing
- Dashboard re-fetches every **15 seconds** automatically

### Step 2: Viewing Incoming Orders
- Cook navigates to **Orders** page
- `Orders.jsx` fetches `GET /orders` on mount
- `setInterval` re-fetches every **10 seconds** — new orders appear automatically
- Orders are sorted newest-first, then grouped into 5 status buckets:
  ```js
  groupedOrders = {
    pending: [...],
    preparing: [...],
    ready: [...],
    out_for_delivery: [...],
    delivered: [...]
  }
  ```
- Each `OrderColumn` receives its filtered array and renders `OrderCard` components
- Initially shows 3 cards per column; "View More" reveals the rest

### Step 3: Updating Order Status
- Cook clicks action button on an `OrderCard`
- `getNextStatus(currentStatus)` maps:
  - `pending` → `preparing`
  - `preparing` → `ready`
  - `ready` → `out_for_delivery`
  - `out_for_delivery` → `delivered`
- `handleUpdate()` calls `onStatusChange(order.id, nextStatus)` which is:
  1. `PUT http://localhost:5000/order/:id/status` with `{ status: newStatus }`
  2. On success: `App.jsx` updates the local `orders` state via `.map()` — card instantly moves column
- Backend `updateOrderStatusInDB()`:
  1. Updates Firestore document status field
  2. If transitioning out of `pending` (first acceptance), triggers **ingredient deduction** asynchronously
  3. Sends WhatsApp notification to customer if phone number is present

### Step 4: Ingredient Deduction (Automatic on Accept)
Triggered when status → `preparing`:
1. For each item in the order, fetch its menu document from Firestore
2. Read `ingredientsUsed` array (each entry: `{ ingredientId, quantity }`)
3. Multiply quantities by item quantity ordered
4. Accumulate total deduction per ingredient across all items
5. For each ingredient in Firestore:
   - Subtract deduction from `quantity`
   - If new quantity ≤ `lowThreshold`: mark as `LOW`
   - Optionally disable menu items that depend on this ingredient
6. Log daily usage to `ingredientUsage` collection
7. Mark order as `ingredientsDeducted: true` to prevent re-deduction

### Step 5: Menu Management Workflow
1. Cook opens **Menu** page
2. Existing items loaded from `GET /menu`
3. Cook clicks **Add Item** → form appears (name, price, category, description, image, availability)
4. On submit → `POST /menu` → Firebase doc created → list refreshed
5. Cook clicks **Edit** on existing card → form pre-filled → on submit → `PUT /menu/:id`
6. Cook clicks **Delete** → `DELETE /menu/:id` → removed from Firebase
7. **Availability Toggle** → instant `PUT /menu/:id` with `{ isAvailable: true/false }` — affects live customer menu within 15s

### Step 6: Inventory Monitoring Workflow
1. `Ingredients.jsx` fetches `GET /ingredients` on load
2. Items sorted: Critical → Low → Safe
3. Cook sees **Low Stock Alerts** section at top for critical items
4. **Smart insight cards** show today's consumption pulled from `GET /analytics` and cross-referenced with ingredient usage
5. Cook uses **inline stepper** to update quantities → `PUT /ingredients/:id`
6. Changes immediately reflected in alert section

### Step 7: Analytics Review Workflow
1. Cook opens **Analytics** page
2. Selects time filter: **Today / This Week / This Month**
3. `Analytics.jsx` computes client-side:
   - Filters orders by creation date against selected range
   - Sums `totalPrice` for delivered orders only → **Total Revenue**
   - Counts delivered orders → **Total Orders**
   - Divides → **Average Order Value**
4. Top selling items ranking derived by counting order frequency per item name
5. Progress bars show each item's share relative to the top seller

---

## 4. Backend — Request Handling Workflow

### 4.1 Server Startup
```
server.js
 ├── require('dotenv').config()          ← loads .env (VERIFY_TOKEN, WHATSAPP_TOKEN, PHONE_NUMBER_ID)
 ├── firebase.js                         ← initializes Admin SDK with service account JSON
 ├── app.use('/', orderRoutes)           ← handles /orders, /order/:id
 ├── app.use('/menu', menuRoutes)
 ├── app.use('/kitchen', kitchenRoutes)
 ├── app.use('/ingredients', ingredientRoutes)
 ├── app.use('/analytics', analyticsRoutes)
 ├── app.use('/webhook', webhookRoutes)
 └── app.listen(5000)
```

### 4.2 New Order Creation Flow
```
Customer clicks "Confirm & Place Order"
       │
       ▼
POST /order  { customer: { name, phone, address }, items: [...], totalPrice }
       │
       ▼
server.js validates fields (name, phone, address, items, totalPrice all required)
       │
       ▼
db.collection('orders').add(orderData)   ← writes to Firestore
       │
       ▼
Response: { message, orderId, timestamp }
       │
       ▼
Payment.jsx calls finalizeOrder(orderId) → success screen shown
```

### 4.3 Order Status Update Flow
```
Cook clicks action button
       │
       ▼
PUT /order/:id/status  { status: "preparing" }
       │
       ▼
orderController.updateOrderStatus()
       │
       ▼
orderService.updateOrderStatusInDB(id, status)
       ├── Firestore: doc.update({ status })
       ├── If first acceptance → handleIngredientDeductions() [async, non-blocking]
       └── sendWhatsAppMessage(phone, statusMessage) [async, non-blocking]
       │
       ▼
Response: full updated order object
       │
       ▼
Cook frontend: optimistic UI update via .map()
```

### 4.4 Order Tracking Fetch Flow
```
TrackOrder.jsx polls every 5s
       │
       ▼
GET /orders/:id
       │
       ▼
orderController.getOrderById()
       │
       ▼
db.collection('orders').doc(id).get()
       │
       ├── If found → return { id, status, items, totalPrice, customerName, address, createdAt }
       └── If not found → 404 { error: "Order not found" }
       │
       ▼
TrackOrder updates orderDetails state → re-renders timeline + banners
```

---

## 5. WhatsApp Chatbot — Step-by-Step Flow

### 5.1 Webhook Verification (One-time Setup)
```
Meta sends GET /webhook?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...
       │
       ▼
webhook.js compares token to process.env.VERIFY_TOKEN
       ├── Match → respond 200 with challenge (verified)
       └── No match → 403 Forbidden
```

### 5.2 Incoming Message Processing
```
User sends WhatsApp message
       │
       ▼
Meta delivers POST /webhook  { entry[0].changes[0].value.messages[0] }
       │
       ▼
webhook.js immediately responds 200 (prevents Meta retry)
       │
       ▼
fetchLiveMenu() → GET Firebase menu (isAvailable == true items only)
       │
       ▼
setLiveMenu(items) → injects into chatbotLogic.js runtime
       │
       ▼
handleChatMessage(from, messageText, sendReply)
```

### 5.3 Full Conversational State Machine

```
State: START
  └── Bot sends: Welcome + Kitchen Status + Language options
  └── Next State: LANGUAGE_SELECTED

State: LANGUAGE_SELECTED
  ├── Input: "1" or "english" → language = English
  ├── Input: "2" or "telugu"  → language = Telugu
  └── Bot sends: Live menu → Next State: ORDERING

State: ORDERING
  ├── Input: valid menu number → saves pendingItem
  └── Bot sends: "How many plates?" → Next State: QUANTITY

State: QUANTITY
  ├── Input: valid number → adds/merges item to cart
  └── Bot sends: cart summary → Next State: ADD_MORE

State: ADD_MORE
  ├── Input: "yes" → Bot sends menu again → ORDERING
  └── Input: "no"  → Bot sends cart with edit commands → EDIT_CART

State: EDIT_CART
  ├── Input: "+N"      → increase item N quantity
  ├── Input: "-N"      → decrease item N quantity
  ├── Input: "remove N"→ delete item N from cart
  ├── Input: "clear"   → empty cart
  └── Input: "next"    → Bot asks for location → LOCATION_ENTERED

State: LOCATION_ENTERED
  ├── Input does NOT include "hyderabad"/"secunderabad" → error, stay in state
  └── Input valid → saves location
      Bot sends: order summary + payment prompt →
      "All orders are prepaid. Type PAY to confirm."
      → Next State: PENDING_PAYMENT

State: PENDING_PAYMENT
  ├── Input: "pay" | "yes" | "done" | "1" | "2"
  │     └── generateOrderId()
  │     └── db.collection('orders').doc(orderId).set({ ... source: "whatsapp" })
  │     └── Bot sends: "Payment received ✅ Order placed! ID: xxx"
  │     └── delete userStates[from]  ← session cleared
  └── Any other input → no action (user can retry)

State: Fallback
  └── Unknown state → "Send Hi to start again" + reset session
```

### 5.4 Order Data Written by Chatbot to Firestore
```json
{
  "phoneNumber": "+91XXXXXXXXXX",
  "language": "English",
  "location": "Hitech City, Hyderabad",
  "items": [
    { "name": "Chicken Biryani", "price": 180, "quantity": 2 }
  ],
  "totalAmount": 360,
  "status": "pending",
  "source": "whatsapp",
  "createdAt": "2026-04-12T..."
}
```
This order then appears in the Cook Dashboard within 10 seconds (next auto-poll cycle).

---

## 6. End-to-End System Flow

### Customer Website Order
```
Customer (Browser)
    │  Browses menu (fetched from Firebase via backend)
    │  Adds items to cart
    │  Fills profile details
    │  Proceeds to Checkout
    │  Selects payment method
    │  Clicks "Confirm & Place Order"
    ▼
Backend (POST /order)
    │  Validates payload
    │  Saves to Firestore with status "pending"
    │  Returns orderId
    ▼
Customer Website
    │  Shows "Payment Successful ✅"
    │  Redirects to Track page
    │  Polls GET /orders/:id every 5s
    ▼
Cook Dashboard
    │  Auto-refreshes orders every 10s
    │  New "pending" order appears in first column
    │  Cook clicks "Accept & Prepare"
    ▼
Backend (PUT /order/:id/status)
    │  Updates Firestore status to "preparing"
    │  Triggers ingredient deduction (async)
    │  Sends WhatsApp notification to customer
    ▼
Customer Track Page
    │  Next poll picks up "preparing" status
    │  Timeline advances, banner updates
    ▼
[Cook moves through: Ready → Out for Delivery → Delivered]
    ▼
Customer Track Page
    │  On "out_for_delivery": delivery partner card appears with ETA
    │  On "delivered": partner card shows ✅ badge
```

### WhatsApp Order
```
Customer (WhatsApp)
    │  Sends "Hi"
    ▼
Backend Webhook
    │  Fetches live menu from Firebase
    │  Runs chatbot state machine
    │  Guides user: Menu → Cart → Location → Payment (PAY)
    │  Saves order to Firestore (source: "whatsapp")
    ▼
Cook Dashboard
    │  New "pending" order from WhatsApp appears in Kanban
    │  Cook processes it identically to website orders
    ▼
Backend (status update)
    │  Sends WhatsApp notification back to customer on each status change
```

---

## 7. Key Configuration Files

| File | Purpose |
|------|---------|
| `backend/.env` | `VERIFY_TOKEN`, `WHATSAPP_TOKEN`, `PHONE_NUMBER_ID` |
| `backend/firebase.js` | Firebase Admin SDK initialization |
| `backend/order-db-*.json` | Firebase service account key |
| `customer_frontend/src/services/api.js` | All customer API call helpers |
| `cook_frontend/src/services/api.js` | All cook API call helpers |
| `backend/chatbotLogic.js` | Full WhatsApp chatbot state machine |
| `backend/services/orderService.js` | Order CRUD + ingredient deduction engine |
| `backend/services/whatsappService.js` | WhatsApp message sending via Meta API |

---

## 8. Data Flow Summary

```
localStorage (Customer Browser)
  ├── userProfile    → Checkout auto-fill
  ├── orderId        → Track page auto-load
  ├── userOrders     → My Orders history
  ├── pendingOrderPayload → Payment page data bridge
  ├── theme          → Dark/light mode preference
  └── kitchenStatus  → Cook's kitchen toggle state

Firebase Firestore Collections
  ├── orders         → All orders (website + WhatsApp)
  ├── menu           → Menu items with availability flags
  ├── ingredients    → Ingredient stock + threshold data
  └── ingredientUsage → Daily consumption tracking per ingredient
```

---

*Documentation generated: April 2026*
