const { db } = require('../firebase');

const getAllIngredients = async (req, res) => {
    try {
        const snapshot = await db.collection('ingredients').get();
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(items);
    } catch (err) {
        console.error("Ingredient update failed", err);
        res.status(500).json({ error: "Failed to fetch ingredients" });
    }
};

const addIngredient = async (req, res) => {
    try {
        const { name, quantity, unit, lowThreshold } = req.body;
        const newIngredient = {
            name: name.trim(),
            quantity: Number(quantity),
            unit: unit || 'kg',
            lowThreshold: Number(lowThreshold || 0),
            createdAt: new Date().toISOString()
        };
        const docRef = await db.collection('ingredients').add(newIngredient);
        res.status(201).json({ id: docRef.id, ...newIngredient });
    } catch (err) {
        console.error("Ingredient update failed", err);
        res.status(500).json({ error: "Failed to add ingredient" });
    }
};

const updateIngredient = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        const docRef = db.collection('ingredients').doc(id);
        const docSnap = await docRef.get();
        if (!docSnap.exists) return res.status(404).json({ error: "Ingredient not found" });

        const oldData = docSnap.data();
        await docRef.update(updates);

        if (updates.quantity !== undefined && updates.quantity > 0 && oldData.quantity <= 0) {
            const menuRef = db.collection('menu');
            const menuSnap = await menuRef.get(); 
            
            const batch = db.batch();
            let hasBatchUpdates = false;

            menuSnap.forEach(menuDoc => {
                const md = menuDoc.data();
                if (!md.isAvailable && md.ingredientsUsed) {
                    const usesThis = md.ingredientsUsed.some(i => i.ingredientId === id);
                    if (usesThis) {
                        batch.update(menuDoc.ref, { isAvailable: true });
                        hasBatchUpdates = true;
                    }
                }
            });

            if (hasBatchUpdates) {
                await batch.commit();
            }
        }

        res.status(200).json({ id, ...oldData, ...updates });
    } catch (err) {
        console.error("Ingredient update failed", err);
        res.status(500).json({ error: "Failed to update ingredient" });
    }
};

const deleteIngredient = async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('ingredients').doc(id).delete();
        res.status(200).json({ message: "Deleted successfully" });
    } catch (err) {
        console.error("Ingredient update failed", err);
        res.status(500).json({ error: "Failed to delete ingredient" });
    }
};

const getIngredientUsage = async (req, res) => {
    try {
        const todayStr = new Date().toISOString().split('T')[0];
        const snapshot = await db.collection('ingredientUsage')
          .where('date', '==', todayStr)
          .get();
          
        const usages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(usages);
    } catch (err) {
        console.error("Ingredient update failed", err);
        res.status(500).json({ error: "Failed to fetch analytics" });
    }
};

module.exports = { getAllIngredients, addIngredient, updateIngredient, deleteIngredient, getIngredientUsage };
