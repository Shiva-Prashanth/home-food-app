# Home Food Ordering System (Unified Single Frontend)

A full-stack homemade food ordering and kitchen management platform featuring a unified React frontend (single Vercel deployment) and a shared Node.js/Express backend integrated with Firebase Firestore.

---

## 🏗 System Architecture

The application is consolidated into a single unified frontend deployment on Vercel connecting to the shared backend on Render:

```
                  ┌────────────────────────────────────────────────────────┐
                  │              ONE SINGLE VERCEL DEPLOYMENT              │
                  │              (https://your-app.vercel.app)             │
                  └──────────────────────────┬─────────────────────────────┘
                                             │
                       ┌─────────────────────┴────────────────────┐
                       ▼                                          ▼
             ┌───────────────────┐                      ┌───────────────────┐
             │  / (Root)         │                      │  /cook            │
             │  Role Selection   │                      │  Cook Dashboard   │
             │  Landing Page     │                      │  • Orders Kanban  │
             └─────────┬─────────┘                      │  • Menu Mgmt      │
                       │                                │  • Kitchen Stock  │
                       ▼                                │  • Analytics      │
             ┌───────────────────┐                      └─────────┬─────────┘
             │  /customer        │                                │
             │  Customer Portal  │                                │
             │  • Menu & Specials│                                │
             │  • Cart & Checkout│                                │
             │  • Online Payment │                                │
             │  • Live Tracking  │                                │
             └─────────┬─────────┘                                │
                       │                                          │
                       └─────────────────────┬────────────────────┘
                                             │
                                             ▼
                               ┌───────────────────────────┐
                               │   EXISTING RENDER BACKEND │
                               │   (Node.js / Express API) │
                               └─────────────┬─────────────┘
                                             │
                                             ▼
                               ┌───────────────────────────┐
                               │   FIREBASE FIRESTORE DB   │
                               │   (Orders, Menu, Stock)   │
                               └───────────────────────────┘
```

---

## 🧭 Application Routes

| Route | View | Description |
|---|---|---|
| `/` | **Role Selector** | Interactive role selection landing page (Customer vs Cook) |
| `/customer` | **Customer Portal** | Daily homemade menu browsing, cart, checkout, prepaid payment, live delivery tracking |
| `/cook` | **Cook Dashboard** | Kitchen admin overview with real-time KPI metrics & status toggle |
| `/cook/orders` | **Orders Pipeline** | Live 5-stage Kanban board (Pending, Preparing, Ready, Out for Delivery, Delivered) |
| `/cook/menu` | **Menu Management** | Food items CRUD, pricing, descriptions, and instant availability toggle |
| `/cook/ingredients` | **Kitchen Inventory** | Ingredient stock tracking, automatic deduction on order acceptance, low-stock alerts |
| `/cook/analytics` | **Kitchen Insights** | Revenue summary, top-selling items, peak ordering times, and average order value |
| `/cook/feedback` | **Customer Reviews** | Customer feedback and dish ratings |
| `/cook/profile` | **Cook Profile** | Kitchen master settings and information |

---

## 📁 Repository Structure

```
home-food-app/
├── backend/                  # Shared Node.js & Express REST API (deployed on Render)
│   ├── routes/               # API routes (orders, menu, kitchen, ingredients, analytics, webhook)
│   ├── services/             # Business logic & Firestore operations
│   ├── firebase.js           # Firebase Admin SDK initialization
│   ├── server.js             # Express entry point
│   └── package.json
│
├── frontend/                 # 🚀 UNIFIED FRONTEND (Deploy this single folder to Vercel)
│   ├── public/               # Static assets & images (favicon, hero, svg icons)
│   ├── src/
│   │   ├── main.jsx          # React DOM entry point
│   │   ├── App.jsx           # Master router with internal client-side routes
│   │   ├── role-selector/    # Role Selection landing component & styles
│   │   ├── customer/         # Complete Customer ordering application & styles
│   │   │   ├── components/   # Navbar, Home, Menu, CartDrawer, Checkout, Payment, TrackOrder, etc.
│   │   │   └── services/     # Customer API communication
│   │   ├── cook/             # Complete Cook dashboard application & styles
│   │   │   ├── components/   # Sidebar, Header, Kanban columns, Summary cards
│   │   │   ├── pages/        # Dashboard, Orders, Menu, Ingredients, Analytics, Profile, Feedback
│   │   │   ├── styles/       # Cook scoped theme & Tailwind styles
│   │   │   └── services/     # Cook API communication
│   │   └── shared/           # Shared API config (VITE_API_URL fallback)
│   ├── index.html
│   ├── vite.config.js        # Vite configuration (port 3000, host enabled)
│   ├── vercel.json           # Vercel SPA rewrite rules for client-side routing
│   └── package.json
│
├── cook_frontend/            # (Archived original cook source)
├── customer_frontend/        # (Archived original customer source)
├── role_selector/            # (Archived original role selector source)
├── test-unified.js           # Automated end-to-end integration test suite
└── README.md
```

---

## 💻 Local Development Setup

Run the application locally with a single frontend and the backend:

### 1. Start the Shared Backend (Port 5000)
```bash
cd backend
npm install
npm run dev
```
Backend will start on `http://localhost:5000` and connect to Firebase Firestore.

### 2. Start the Unified Frontend (Port 3000)
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser to access the complete application with Role Selection, Customer portal (`/customer`), and Cook dashboard (`/cook`).

---

## ☁️ Deploying to Vercel (Single Unified Deployment)

Deploy **only one** frontend project to Vercel:

1. Import repository `Shiva-Prashanth/home-food-app` into [Vercel](https://vercel.com).
2. Configure the project settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
3. Add Environment Variable:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://YOUR-EXISTING-RENDER-BACKEND.onrender.com` *(your running Render backend URL)*
4. Click **Deploy**.

The single Vercel deployment will serve `/`, `/customer`, `/cook`, and all nested routes seamlessly with full client-side routing and direct URL refresh support (configured via `vercel.json`).

---

## 🧪 Testing

Run the automated integration test script:
```bash
node test-unified.js
```
This tests:
- SPA route accessibility for `/`, `/customer`, `/cook/*`
- Backend & Firebase Firestore live connectivity
- Customer order creation (`POST /order`)
- Cook live pipeline order retrieval (`GET /orders`)
- Cook order status advancement (`PUT /order/:id/status`)
- Customer real-time live status tracking (`GET /orders/:id`)
