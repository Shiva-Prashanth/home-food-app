const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/summary', analyticsController.getSummary);
router.get('/top-items', analyticsController.getTopItems);
router.get('/ingredient-usage', analyticsController.getIngredientUsage);
router.get('/order-status', analyticsController.getOrderStatus);
router.get('/peak-time', analyticsController.getPeakTime);
router.get('/low-stock', analyticsController.getLowStock);

module.exports = router;
