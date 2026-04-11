const express = require('express');
const router = express.Router();
const controller = require('../controllers/ingredientController');

router.get('/usage/today', controller.getIngredientUsage);
router.get('/', controller.getAllIngredients);
router.post('/', controller.addIngredient);
router.put('/:id', controller.updateIngredient);
router.delete('/:id', controller.deleteIngredient);

module.exports = router;
