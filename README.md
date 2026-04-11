# Home Food Ordering System

Welcome to the Home Food Ordering System! This project is a full-stack web application designed for a seamless food ordering experience. It consists of a modern React frontend and a robust Node.js/Express backend capable of integrating with Firebase Firestore.

## 📁 Project Structure

The project has been separated into two distinct folders for clear organization:

### 1. `frontend/` (React via Vite)
This folder contains the user interface of the application. It's built with functional React components, hooks, and clean, customized vanilla CSS.

**Key Files & Components:**
- `src/App.jsx`: The main entry point handling state (like the cart items) and switching between the different views (Home, Cart, Checkout).
- `src/components/FoodList.jsx`: Displays the menu items in a dynamic grid layout. Users can add items to their cart from here.
- `src/components/Cart.jsx`: Allows users to review their selected items, calculate the total price, and remove items if they change their mind.
- `src/components/Checkout.jsx`: The final step where users input their delivery details (Name, Phone, Address) which sends an API request to the backend.
- `src/data.js`: Contains beautiful mock data with high-quality descriptions and images loaded directly from Unsplash.
- `src/index.css`: A comprehensive CSS file implementing a vibrant, responsive design theme with hover animations.

### 2. `backend/` (Node.js & Express)
This folder serves as the REST API backend handling business logic and database interactions.

**Key Files:**
- `server.js`: The Express server setup. It handles CORS, parses JSON, and provides the main `POST /order` endpoint.
- `firebase.js`: Contains the Firebase Firestore integration logic. It is built to accept the specific `order-db-187da-firebase-adminsdk-fbsvc-9487887d7d.json` for real-world interactions.

>**Note on Database Mocking:** If `order-db-187da-firebase-adminsdk-fbsvc-9487887d7d.json` is missing, the backend will purposefully fail to start and print a clean error.

---

## 🚀 How to Run the Application

Because this is a full-stack application, you need to run **both** the backend and the frontend simultaneously in **two separate terminal windows**.

### Step 1: Start the Backend Server (Terminal 1)
Open a terminal, navigate inside the `backend` folder, and start the node server.
```bash
cd backend
npm run dev
```
*(You should see a message saying "Server is running on http://localhost:5000")*

### Step 2: Start the Frontend App (Terminal 2)
Open a completely new terminal window, navigate inside the `frontend` folder, and start the Vite development server.
```bash
cd frontend
npm run dev
```
*(You should see a local URL, e.g., `http://localhost:5173`. Open this link in your browser to view the application!)*

---

## 🔌 API Documentation

If you want to test the backend strictly through HTTP requests (like using Postman), here is the available endpoint:

### `POST /order`
Creates a brand new order representing a user's cart and delivery details.

**Request Body (JSON):**
```json
{
  "customer": {
    "name": "John Doe",
    "phone": "+1 234 567 8900",
    "address": "123 Main St, Apt 4B"
  },
  "items": [
    {
      "id": 1,
      "name": "Classic Cheeseburger",
      "price": 12.99
    }
  ],
  "totalPrice": 12.99
}
```

**Success Response (201 Created):**
```json
{
  "message": "Order created successfully",
  "orderId": "mock-id-1712234000000"
}
```
