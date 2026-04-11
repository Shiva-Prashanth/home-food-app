const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/orders', orderController.getAllOrders);
router.put('/order/:id/status', orderController.updateOrderStatus);

module.exports = router;
