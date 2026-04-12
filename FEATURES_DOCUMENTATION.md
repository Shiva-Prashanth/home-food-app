# FEATURES DOCUMENTATION
### Home Food Ordering System — Full Platform

---

## 1. Project Overview

This is a full-stack, multi-portal **Home Food Ordering System** designed to simulate a real-world food delivery service. The platform consists of three independently deployed applications sharing a single backend:

| Portal | Audience | Technology |
|--------|----------|-----------|
| **Customer Website** | End customers placing food orders | React (Vite), CSS |
| **Cook Dashboard** | Kitchen staff managing orders & inventory | React (Vite), TailwindCSS |
| **Backend API** | Shared server powering both frontends + WhatsApp bot | Node.js, Express, Firebase Firestore |

A **WhatsApp chatbot** provides an alternative ordering channel for customers without access to the website.

---

## 2. Customer Website — Features

### 2.1 Home Page
- Welcome landing page with hero section and animated UI
- **Kitchen Status Banner** — dynamically fetches and displays current kitchen load (Low / Medium / High Busy) with estimated delivery time
- Promotional sections and call-to-action to browse the menu
- Quick navigation to Menu, Track Order, and Cart

### 2.2 Menu Browsing
- Fetches live menu from the backend (Firebase Firestore) every **15 seconds** (auto-refresh)
- Displays food items as rich visual cards with:
  - Item name, description, price
  - Category badges
  - Availability indicators (items marked unavailable by cook are hidden/dimmed)
- **Category Filtering** — clickable tabs to filter menu by food category (e.g., Meals, Snacks, etc.)
- **Search** — real-time keyword search to filter items by name

### 2.3 Add to Cart
- One-click add-to-cart from menu cards
- In-card quantity increment/decrement controls
- Cart item count shown live in the Navbar
- **Cart Drawer** — a slide-out panel accessible from any page showing:
  - All cart items with quantity controls
  - Individual item remove buttons
  - Running total
  - "Proceed to Checkout" button
- **Floating Cart Button** — persistent bottom-right button when items are in cart (hidden on checkout/payment pages)
- Global **Toast Notifications** confirm actions ("Item added", "Item removed")

### 2.4 Checkout
- Full checkout form reading delivery details from the saved **Profile**
- Displays:
  - Order summary (item count, estimated delivery time, total amount)
  - Delivery address card (auto-populated from profile)
  - Edit Address shortcut → Profile page
  - Special Instructions text area (optional, e.g. "less spicy")
- **City Validation** — blocks checkout if profile city is outside service area (Hyderabad / Secunderabad only), with a clear error message
- **Prepaid Notice Banner** — "All orders are prepaid. Cash on Delivery is not available."
- Button text: **Proceed to Payment →** (disabled if profile incomplete or unsupported city)

### 2.5 Payment (Mock — UI Only)
- Dedicated **Payment Page** with "Complete Your Payment" heading
- Order summary panel showing customer name and total amount
- **3 Payment Method Options:**
  - **UPI Payment** (GPay, PhonePe, Paytm) — default selected, visual highlight
  - **Credit / Debit Card** — selectable, visual highlight
  - **Cash on Delivery** — permanently disabled with strikethrough and note: *"Not available. All orders are prepaid."*
- Selecting a method visually highlights the card (border + background color change)
- **Confirm & Place Order** button — single click places the order
- No real payment gateway; no input fields; no validation
- On click: order is created via backend API → success screen shown
- **Fallback**: if backend is unreachable, a local order ID is generated and success is still shown
- **Success Screen** shows:
  - "Payment Successful ✅" heading
  - Order ID (copyable to clipboard)
  - Special instructions note (if entered)
  - Buttons: "Back to Menu" and "Track Delivery Now"

### 2.6 Order Tracking
- Track any order by Order ID via search form
- **Auto-loads** the most recent order ID from `localStorage` on page load
- **Live polling every 5 seconds** — page auto-updates without refresh
- **Prepaid Notice** banner at the top
- **Graphical Progress Timeline** with 5 stages:
  1. ⏳ Pending
  2. 🍳 Preparing
  3. 📦 Ready
  4. 🚚 Out for Delivery
  5. ✅ Delivered
- Filled progress bar advances between stages with smooth animation
- **Contextual Status Banner** — unique color-coded message for each stage:
  - Orange → Pending, Blue → Preparing, Green → Ready, Purple → Out for Delivery, Bright Green → Delivered
- **Delivery Partner Card** (appears when status = Out for Delivery or Delivered):
  - Mock partner name, phone number, emoji avatar
  - ETA badge (e.g., "20–30 mins") swaps to "✅ Delivered" when done
  - Partner is deterministically assigned per `orderId` (stable across refreshes)
- **Receipt section** showing all ordered items, quantities, prices, and total paid

### 2.7 My Orders (Order History)
- Loads order history from `localStorage`
- Displays all past orders sorted newest-first
- Each order card shows: Order ID, date, status badge, item list, total
- **Review & Rating system** — customers can submit a star rating (1–5) and text comment on delivered orders
- Reviews are saved in `localStorage`

### 2.8 Profile
- Form to save personal delivery details:
  - Full name, phone number
  - House/flat, street, city, state
- Saved to `localStorage` for auto-fill in Checkout
- Profile data persists across sessions

### 2.9 Navigation & Accessibility
- Responsive **Navbar** with links to: Home, Menu, Track, My Orders, Profile
- Cart item count badge on Navbar
- Dark mode support (toggle saved to `localStorage`)
- **Footer** with branding and quick links

---

## 3. Cook Website (Dashboard) — Features

### 3.1 Dashboard (Home)
- Auto-refreshing KPI summary cards:
  - **Total Orders** (all-time with today count breakdown)
  - **Total Revenue** (calculated from delivered orders)
  - **Average Order Value**
  - **Pending Orders** count (clickable → jumps to Orders page)
- **Kitchen Load Status Panel** — shows busy level (Low / Medium / High) with color coding
- **Kitchen Open/Close Toggle** — allows cook to set kitchen as Open or Closed; status persists in `localStorage` and syncs to backend
- **Low Stock Alerts widget** — shows top ingredients that are below threshold
- **Order Status Breakdown** — visual count of orders per status
- **Recent Activity Feed** — latest orders with inline status badge
- **Live Activity Indicator** — "Live" badge pulsing in header

### 3.2 Order Management (Kanban Board)
- **5-column Kanban board** representing all order stages:
  1. 🟠 Pending
  2. 🔵 Preparing
  3. 🟢 Ready
  4. 🟣 Out for Delivery
  5. ⚫ Delivered
- Each column shows count badge and color-coded header
- **Auto-refresh every 10 seconds** so new orders appear without manual reload
- Per-column **"View More / Show Less"** toggle (initially shows 3 orders per column)
- Each order card displays:
  - Customer name / Order ID
  - Order items list with quantities
  - Time of placement
  - Total price in green
  - Status badge
- **Action buttons** per status:
  - Pending → "Accept & Prepare"
  - Preparing → "Mark Ready"
  - Ready → "Out for Delivery 🚚"
  - Out for Delivery → "Mark Delivered"
  - Delivered → No button (terminal state)
- Status updates call the backend API and **optimistically update** the UI without full reload

### 3.3 Menu Management
- View all menu items in a grid layout
- **Add New Item** form with:
  - Name, description, price, category
  - Image upload
  - Availability toggle
- **Edit existing items** — inline edit form per card
- **Delete items** — remove from menu
- **Toggle Availability** — mark items as available / unavailable (affects live customer menu)
- Changes sync directly to Firebase via backend

### 3.4 Inventory / Ingredients Management (Smart Dashboard)
- Full ingredient inventory table with:
  - Ingredient name, quantity, unit, threshold
  - Status indicator: ✅ Safe / ⚠️ Low / 🔴 Critical
- **Low Stock Priority Alerts** — top section highlights critical and low ingredients sorted by urgency
- **Smart Insight Cards** — "Today's Consumption" section showing:
  - Each ingredient used today
  - Quantity consumed
  - Progress bar (used vs. available)
  - Color-coded status (Green/Yellow/Red)
- **Search & Filter** — real-time ingredient name search
- **Inline Quantity Stepper** — update stock levels without full form
- **Restock reminder** on critical items
- "Most Used Today" leaderboard — top ingredients by today's consumption volume

### 3.5 Analytics / Insights
- **Time filter**: Today / This Week / This Month dropdown — dynamically filters order data client-side
- **3 KPI metric cards**:
  - Total Delivered Orders
  - Total Revenue (calculated from delivered orders only)
  - Average Order Value
- **Top Selling Items** leaderboard — podium-style ranking (#1, #2, #3) with visual progress bars
- **Ingredient Usage Chart** — visual comparison of ingredient consumption
- **Smart Highlight widget** — identifies and calls out the most consumed ingredient

### 3.6 Feedback Portal
- Dedicated page showing all customer feedback/reviews
- Card-based list view with:
  - Customer name
  - Star rating (⭐ display)
  - Written comment
- Empty state message: "No feedback yet" if no reviews exist
- Accessible from sidebar navigation

### 3.7 Header & Notifications
- Cook dashboard header with:
  - Hamburger menu (sidebar toggle on mobile)
  - Page title
  - **Notification Bell** — polls backend for low-stock ingredients; shows count badge when items are below threshold
  - Live indicator badge

### 3.8 Sidebar Navigation
- Responsive collapsible sidebar with links to:
  - Dashboard
  - Orders
  - Menu
  - Ingredients
  - Analytics
  - Feedback
- Active route highlighting
- Brand logo / title

### 3.9 Cook Profile
- Cook name and role display
- Settings panel for personal preferences

---

## 4. Backend — Features

### 4.1 Order Management API
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/order` | Create a new order (stores to Firestore) |
| GET | `/orders` | Fetch all orders |
| GET | `/orders/:id` | Fetch single order by ID (used for tracking) |
| PUT | `/order/:id/status` | Update order status |

### 4.2 Menu API
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/menu` | Fetch all menu items |
| POST | `/menu` | Add new menu item |
| PUT | `/menu/:id` | Update menu item |
| DELETE | `/menu/:id` | Delete menu item |

### 4.3 Kitchen Status API
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/kitchen/status` | Get current kitchen load and estimated time |
| PUT | `/kitchen/status` | Update kitchen open/close and load status |

### 4.4 Ingredients API
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/ingredients` | Fetch all ingredients |
| POST | `/ingredients` | Add ingredient |
| PUT | `/ingredients/:id` | Update ingredient quantity/details |
| DELETE | `/ingredients/:id` | Delete ingredient |

### 4.5 Analytics API
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/analytics/summary` | Revenue, order count summaries |
| GET | `/analytics/status` | Order count by status |
| GET | `/analytics/low-stock` | Ingredients below threshold |

### 4.6 Ingredient Deduction Engine
- When an order is moved to `preparing`, the system:
  - Looks up each ordered item in the menu collection
  - Reads `ingredientsUsed` array per item
  - Deducts quantities from ingredient stock in Firestore (batch write)
  - If stock falls below threshold, marks ingredient as LOW and can disable affected menu items
  - Logs daily consumption to `ingredientUsage` collection

### 4.7 Data Storage (Firebase Firestore)
- Collections: `orders`, `menu`, `ingredients`, `ingredientUsage`
- All reads/writes use Firebase Admin SDK on the server
- Real-time consistency guaranteed via Firestore transactions and batch writes

### 4.8 WhatsApp Notification on Order Status Changes
- When cook updates order status, backend sends a WhatsApp message to the customer's phone number
- Messages per status:
  - Accepted: "✅ Your order has been accepted"
  - Preparing: "🍳 Your order is being prepared"
  - Ready: "📦 Your order is ready"
  - Out for Delivery: "🚚 Your order is out for delivery"
  - Delivered: "🎉 Your order has been delivered"

---

## 5. WhatsApp Chatbot — Features

### 5.1 Integration Method
- Connected via **Meta WhatsApp Business API**
- Webhook registered at `/webhook` on the backend
- Access token and phone number ID stored in `.env`

### 5.2 Conversational Ordering Flow
The chatbot guides users through a full ordering experience with these steps:

1. **Greeting** — Welcome message with kitchen status (busy level + ETA)
2. **Language Selection** — English or Telugu
3. **Menu Display** — Live menu fetched from Firebase, numbered list
4. **Item Selection** — User picks item number
5. **Quantity Selection** — User enters quantity
6. **Continue / Review Cart** — User chooses to add more or review
7. **Cart Editing** — Commands supported:
   - `+N` — increase item N
   - `-N` — decrease item N
   - `remove N` — remove item
   - `clear` — empty cart
   - `next` — proceed
8. **Location Input** — User types delivery location
9. **Area Validation** — Only Hyderabad / Secunderabad accepted
10. **Payment Step** — Bot presents: "All orders are prepaid. Type PAY to confirm your order."
11. **Order Confirmation** — User types PAY / YES / DONE → order saved to Firestore → confirmation message with Order ID sent

### 5.3 Live Menu Injection
- On every incoming message, the webhook fetches only `isAvailable == true` items from Firebase
- Injects them into the chatbot runtime — customers always see the current live menu

### 5.4 Static Menu Fallback
- If Firebase is unreachable, a hardcoded static menu is used automatically
- Ensures the bot never goes offline due to database issues

### 5.5 Session State Management
- Per-user in-memory state object (`userStates`) tracks each user's conversation step and cart
- State is reset after order confirmation or cancellation
- Supports simultaneous sessions for multiple users

### 5.6 In-Session Cart Management
- Full CRUD cart operations within the WhatsApp conversation
- Totals calculated and displayed at each step
- Cart persists through the entire conversation until confirmed or cleared

---

*Documentation generated: April 2026*
