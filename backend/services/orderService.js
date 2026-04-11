const { db } = require('../firebase');
const { sendWhatsAppMessage } = require('./whatsappService');

const fetchOrdersFromDB = async () => {
    const ordersSnapshot = await db.collection('orders').get();
    const orders = ordersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            customer: {
                name: data.customerName || data.customer?.name,
                phone: data.phone || data.customer?.phone,
                address: data.address || data.customer?.address
            },
            items: data.items || [],
            totalPrice: data.totalPrice || 0,
            status: data.status || 'pending',
            createdAt: data.createdAt || null
        };
    });
    return orders;
};

const handleIngredientDeductions = async (items, orderRef, orderId) => {
    console.log("Processing order:", orderId);
    const batch = db.batch();
    const ingredientDeductions = {}; 
    
    for (const orderItem of items) {
        console.log("Item:", orderItem.itemId || orderItem.name);
        let menuDocSnap = null;
        if (orderItem.itemId) {
            menuDocSnap = await db.collection('menu').doc(orderItem.itemId).get();
        } else {
            const ms = await db.collection('menu').where('name', '==', orderItem.name).get();
            if (!ms.empty) menuDocSnap = ms.docs[0];
        }

        if (menuDocSnap && menuDocSnap.exists) {
            const menuData = menuDocSnap.data();
            
            let usesIngredients = menuData.ingredientsUsed;

            if (!usesIngredients || !Array.isArray(usesIngredients) || usesIngredients.length === 0) {
                console.log("Using fallback ingredients for:", menuData.name);
                usesIngredients = [];
                const fallbackMap = [
                    { name: 'onion', quantity: 0.1 },
                    { name: 'tomato', quantity: 0.2 },
                    { name: 'oil', quantity: 0.05 },
                    { name: 'lpg', quantity: 0.02 }
                ];
                
                // Fetch ingredient IDs natively
                for (const fb of fallbackMap) {
                    const snap = await db.collection('ingredients').where('name', '==', fb.name).get();
                    if (!snap.empty) {
                        usesIngredients.push({ ingredientId: snap.docs[0].id, quantity: fb.quantity });
                    }
                }
            }

            if (usesIngredients && Array.isArray(usesIngredients)) {
                for (const iu of usesIngredients) {
                    const reqQty = (iu.quantity || 0) * (orderItem.quantity || 1);
                    if (!ingredientDeductions[iu.ingredientId]) {
                        ingredientDeductions[iu.ingredientId] = { val: 0, name: null };
                    }
                    ingredientDeductions[iu.ingredientId].val += reqQty;
                }
            }
        }
    }

    const todayStr = new Date().toISOString().split('T')[0];
    
    for (const [ingId, reqPayload] of Object.entries(ingredientDeductions)) {
        const totalReq = reqPayload.val;
        if (totalReq <= 0) continue;

        const ingRef = db.collection('ingredients').doc(ingId);
        const ingDoc = await ingRef.get();
        if (ingDoc.exists) {
            const currentQty = ingDoc.data().quantity;
            const ingName = ingDoc.data().name;
            const lowThreshold = ingDoc.data().lowThreshold || 0;
            
            console.log("Ingredient deduction:", ingId, totalReq);

            let deduction = totalReq;
            if (totalReq > currentQty) {
                console.warn(`Ingredient shortage: ${ingName} insufficient`);
                deduction = currentQty;
            }
            if (deduction < 0) deduction = 0;
            
            const newQty = currentQty - deduction;
            batch.update(ingRef, { quantity: newQty });

            if (newQty <= lowThreshold) {
                batch.update(ingRef, { status: "LOW" }); // Additional logic to explicitly mark LOW if desired
                const menuQuery = await db.collection('menu').get();
                menuQuery.forEach(md => {
                    if (md.data().ingredientsUsed && md.data().isAvailable) {
                        const usesThis = md.data().ingredientsUsed.some(u => u.ingredientId === ingId);
                        if (usesThis) batch.update(md.ref, { isAvailable: false });
                    }
                });
            }

            const usageQuery = await db.collection('ingredientUsage')
                .where('date', '==', todayStr)
                .where('ingredientId', '==', ingId)
                .get();

            if (usageQuery.empty) {
                const usageRef = db.collection('ingredientUsage').doc();
                batch.set(usageRef, {
                    ingredientId: ingId,
                    name: ingName,
                    date: todayStr,
                    totalUsed: deduction
                });
            } else {
                const usageRef = usageQuery.docs[0].ref;
                const oldTotal = usageQuery.docs[0].data().totalUsed || 0;
                batch.update(usageRef, { totalUsed: oldTotal + deduction });
            }
        }
    }

    batch.update(orderRef, { ingredientsDeducted: true });
    await batch.commit();
};

const updateOrderStatusInDB = async (orderId, status) => {
    const docRef = db.collection('orders').doc(orderId);
    const doc = await docRef.get();
    if (!doc.exists) {
        throw new Error('Order not found');
    }
    const orderData = doc.data();
    
    let isAcceptedTransition = false;
    if (status === 'accepted' && !orderData.ingredientsDeducted) {
        isAcceptedTransition = true;
    }

    await docRef.update({ status });
    console.log(`Successfully updated order ${orderId} status to: ${status}`);
    
    const updatedDoc = await docRef.get();
    const data = updatedDoc.data();
    
    if (isAcceptedTransition) {
        try {
            await handleIngredientDeductions(data.items || [], docRef, orderId);
        } catch (err) {
            console.error("Ingredient update failed", err);
        }
    }
    
    const phone = data.phone || data.customer?.phone || data.phoneNumber;
    
    if (!data.phone && !data.phoneNumber) {
        console.log("Skipping WhatsApp: No phone number");
    } else if (phone) {
        let message = "";
        switch(status) {
            case "accepted": message = "✅ Your order has been accepted"; break;
            case "preparing": message = "🍳 Your order is being prepared"; break;
            case "ready": message = "📦 Your order is ready"; break;
            case "out_for_delivery": message = "🚚 Your order is out for delivery"; break;
            case "delivered": message = "🎉 Your order has been delivered"; break;
        }
        if (message) {
            // Using then/catch to not block the response if WhatsApp fails
            sendWhatsAppMessage(phone, message).catch(err => console.error(err));
        }
    }

    return {
        id: updatedDoc.id,
        customer: {
            name: data.customerName || data.customer?.name,
            phone: data.phone || data.customer?.phone,
            address: data.address || data.customer?.address
        },
        items: data.items || [],
        totalPrice: data.totalPrice || 0,
        status: data.status || status,
        createdAt: data.createdAt || null
    };
};

module.exports = {
    fetchOrdersFromDB,
    updateOrderStatusInDB
};
