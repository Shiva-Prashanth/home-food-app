const menuService = require('../services/menuService');

const VALID_CATEGORIES = ['Veg', 'Non-Veg', 'Diet', 'Beverages', 'Desserts', 'Snacks', 'Other'];

const { db } = require('../firebase');

const ensureDefaultIngredients = async () => {
    const defaults = [
        { name: "onion", quantity: 0.1, unit: "kg" },
        { name: "tomato", quantity: 0.1, unit: "kg" },
        { name: "oil", quantity: 0.05, unit: "liter" },
        { name: "lpg", quantity: 0.02, unit: "unit" }
    ];
    let mapping = [];

    const ingRef = db.collection('ingredients');
    for (const def of defaults) {
        const snap = await ingRef.where('name', '==', def.name).get();
        let ingId;
        if (snap.empty) {
            const newItem = {
                name: def.name,
                quantity: 10,
                unit: def.unit,
                lowThreshold: 1,
                createdAt: new Date().toISOString()
            };
            const docRef = await ingRef.add(newItem);
            ingId = docRef.id;
        } else {
            ingId = snap.docs[0].id;
        }
        mapping.push({ ingredientId: ingId, quantity: def.quantity });
    }
    return mapping;
};

async function getAllMenuItems(req, res) {
  try {
    const items = await menuService.fetchAllMenuItems();
    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
}

async function addMenuItem(req, res) {
  try {
    const { name, description, price, category, isAvailable, isSpecial, imageUrl, ingredientsUsed, useDefaultIngredients } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Item name is required' });
    }
    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ error: 'A valid price is required' });
    }
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `Category must be one of: ${VALID_CATEGORIES.join(', ')}` });
    }

    let finalIngredients = [];
    if (useDefaultIngredients || !ingredientsUsed || ingredientsUsed.length === 0) {
        finalIngredients = await ensureDefaultIngredients();
    } else if (Array.isArray(ingredientsUsed)) {
        finalIngredients = ingredientsUsed;
    }

    const itemData = {
      name: name.trim(),
      description: (description || '').trim(),
      price: Number(price.toFixed(2)),
      category,
      isAvailable: Boolean(isAvailable),
      isSpecial: Boolean(isSpecial),
      imageUrl: (imageUrl || '').trim(),
      ingredientsUsed: finalIngredients
    };

    const newItem = await menuService.addMenuItemToDB(itemData);
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error adding menu item:', error);
    res.status(500).json({ error: 'Failed to add menu item' });
  }
}

async function updateMenuItem(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.price !== undefined && (typeof updates.price !== 'number' || updates.price <= 0)) {
      return res.status(400).json({ error: 'A valid price is required' });
    }
    if (updates.category !== undefined && !VALID_CATEGORIES.includes(updates.category)) {
      return res.status(400).json({ error: `Category must be one of: ${VALID_CATEGORIES.join(', ')}` });
    }

    if (updates.useDefaultIngredients) {
        updates.ingredientsUsed = await ensureDefaultIngredients();
        delete updates.useDefaultIngredients;
    }

    const updatedItem = await menuService.updateMenuItemInDB(id, updates);
    res.status(200).json(updatedItem);
  } catch (error) {
    if (error.message === 'Menu item not found') {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
}

async function deleteMenuItem(req, res) {
  try {
    const { id } = req.params;
    const result = await menuService.deleteMenuItemFromDB(id);
    res.status(200).json({ message: 'Menu item deleted successfully', ...result });
  } catch (error) {
    if (error.message === 'Menu item not found') {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
}

module.exports = { getAllMenuItems, addMenuItem, updateMenuItem, deleteMenuItem };
