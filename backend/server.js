require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { db } = require('./firebase');

const app = express();
const PORT = process.env.PORT || 5000;

// ── CORS ──────────────────────────────────────────────────────────────────
// Add your deployed frontend URL to the ALLOW_ORIGINS env var (comma-separated).
// e.g. ALLOW_ORIGINS=https://my-app.onrender.com,https://my-app.vercel.app
const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
];
const extraOrigins = process.env.ALLOW_ORIGINS
  ? process.env.ALLOW_ORIGINS.split(',').map(o => o.trim())
  : [];
const allowedOrigins = [...defaultOrigins, ...extraOrigins];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked request from: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use('/webhook', require('./routes/webhook'));
const orderRoutes = require('./routes/orderRoutes');
app.use('/', orderRoutes);
const menuRoutes = require('./routes/menuRoutes');
app.use('/menu', menuRoutes);
const kitchenRoutes = require('./routes/kitchenRoutes');
app.use('/kitchen', kitchenRoutes);
const ingredientRoutes = require('./routes/ingredientRoutes');
app.use('/ingredients', ingredientRoutes);
const analyticsRoutes = require('./routes/analyticsRoutes');
app.use('/analytics', analyticsRoutes);

// POST /order -> store order details
app.post('/order', async (req, res) => {
  try {
    const { customer, items, totalPrice } = req.body;

    // Validate overall structure
    if (!customer || typeof customer !== 'object') {
      return res.status(400).json({ error: 'Missing or invalid customer object' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }
    if (typeof totalPrice !== 'number' || totalPrice <= 0) {
      return res.status(400).json({ error: 'Valid total price is required' });
    }

    // Validate customer fields precisely
    const { name, phone, address } = customer;
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Customer name is required and cannot be empty' });
    }
    if (!phone || typeof phone !== 'string' || phone.trim() === '') {
      return res.status(400).json({ error: 'Customer phone is required and cannot be empty' });
    }
    if (!address || typeof address !== 'string' || address.trim() === '') {
      return res.status(400).json({ error: 'Delivery address is required and cannot be empty' });
    }

    const orderData = {
      customerName: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      items: items,
      totalPrice: Number(totalPrice.toFixed(2)),
      status: "pending",
      createdAt: new Date().toISOString()
    };

    // Save strictly to Firebase Firestore Collection "orders"
    const docRef = await db.collection('orders').add(orderData);

    // Return proper success structure and ID
    res.status(201).json({ 
      message: 'Order created successfully!', 
      orderId: docRef.id,
      timestamp: orderData.createdAt
    });
  } catch (error) {
    console.error("Error saving order: ", error);
    res.status(500).json({ error: 'Internal server error while processing your order' });
  }
});

// GET /order/:id -> fetch order tracking details
app.get('/order/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.trim() === '') {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const docRef = db.collection('orders').doc(id.trim());
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Order not found. Please check your Order ID.' });
    }

    const orderData = doc.data();
    
    // Return relevant tracking data
    res.status(200).json({
      id: doc.id,
      status: orderData.status,
      items: orderData.items,
      totalPrice: orderData.totalPrice,
      createdAt: orderData.createdAt
    });
  } catch (error) {
    console.error("Error fetching order: ", error);
    res.status(500).json({ error: 'Internal server error while fetching order details' });
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
