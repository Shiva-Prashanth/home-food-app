const express = require('express');
const router = express.Router();
const kitchenController = require('../controllers/kitchenController');

router.get('/status', kitchenController.getStatus);
router.put('/status', kitchenController.updateStatus);

module.exports = router;
