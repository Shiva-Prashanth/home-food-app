const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/orders', orderController.getAllOrders);
router.get('/orders/:id', orderController.getOrderById);
router.put('/order/:id/status', orderController.updateOrderStatus);

module.exports = router;
