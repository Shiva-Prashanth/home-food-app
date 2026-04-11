const { db } = require('../firebase');

// Helper to get today's bounds in Server's Local Time converted to ISO strings for Firestore comparison
const getTodayBounds = () => {
    const now = new Date();
    // 00:00:00.000 Local Time
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    // 23:59:59.999 Local Time
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    return {
        startOfDay: start.toISOString(),
        endOfDay: end.toISOString()
    };
};

const getTodayOrders = async () => {
    const { startOfDay, endOfDay } = getTodayBounds();
    const snap = await db.collection('orders')
        .where('createdAt', '>=', startOfDay)
        .where('createdAt', '<=', endOfDay)
        .get();
    
    return snap.docs.map(doc => doc.data());
};

const getSummary = async (req, res) => {
    try {
        const orders = await getTodayOrders();
        
        if (orders.length === 0) {
            return res.status(200).json({ totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 });
        }
        
        let totalRevenue = 0;
        orders.forEach(o => {
            totalRevenue += (o.totalPrice || 0);
        });
        
        const avgOrderValue = totalRevenue / orders.length;
        
        res.status(200).json({
            totalOrders: orders.length,
            totalRevenue: Number(totalRevenue.toFixed(2)),
            avgOrderValue: Number(avgOrderValue.toFixed(2))
        });
    } catch (err) {
        console.error("Analytics fetch failed", err);
        res.status(500).json({ error: "Failed to fetch summary" });
    }
};

const getTopItems = async (req, res) => {
    try {
        const orders = await getTodayOrders();
        let itemStats = {};
        
        orders.forEach(order => {
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                    const name = item.name || "Unknown Item";
                    const qty = item.quantity || 1;
                    
                    if (!itemStats[name]) {
                        itemStats[name] = { name: name, count: 0, totalQuantity: 0 };
                    }
                    itemStats[name].count += 1;
                    itemStats[name].totalQuantity += qty;
                });
            }
        });
        
        const sortedItems = Object.values(itemStats).sort((a, b) => b.totalQuantity - a.totalQuantity).slice(0, 5);
        res.status(200).json(sortedItems);
    } catch (err) {
        console.error("Analytics fetch failed", err);
        res.status(500).json({ error: "Failed to fetch top items" });
    }
};

const getIngredientUsage = async (req, res) => {
    try {
        const todayStr = new Date().toLocaleDateString('en-CA'); // Get local date in YYYY-MM-DD
        const snap = await db.collection('ingredientUsage').where('date', '==', todayStr).get();
        
        const output = [];
        const allIngs = await db.collection('ingredients').get();
        const unitMap = {};
        allIngs.forEach(d => {
            unitMap[d.id] = d.data().unit || 'unit';
        });

        snap.docs.forEach(doc => {
            const data = doc.data();
            output.push({
                name: data.name,
                used: data.totalUsed,
                unit: unitMap[data.ingredientId] || 'unit'
            });
        });
        
        res.status(200).json(output);
    } catch (err) {
        console.error("Analytics fetch failed", err);
        res.status(500).json({ error: "Failed to fetch usage" });
    }
};

const getOrderStatus = async (req, res) => {
    try {
        const orders = await getTodayOrders();
        
        const stats = {
            pending: 0,
            accepted: 0,
            preparing: 0,
            ready: 0,
            out_for_delivery: 0,
            delivered: 0
        };
        
        orders.forEach(o => {
            if (stats[o.status] !== undefined) {
                stats[o.status] += 1;
            }
        });
        
        res.status(200).json(stats);
    } catch (err) {
        console.error("Analytics fetch failed", err);
        res.status(500).json({ error: "Failed to fetch order status" });
    }
};

const getPeakTime = async (req, res) => {
    try {
        const orders = await getTodayOrders();
        if (orders.length === 0) {
            return res.status(200).json({ peakHour: "No data", orderCount: 0 });
        }
        
        const hourMap = {};
        orders.forEach(o => {
            if (o.createdAt) {
                const localDate = new Date(o.createdAt);
                const hour = localDate.getHours();
                if (!hourMap[hour]) hourMap[hour] = 0;
                hourMap[hour] += 1;
            }
        });
        
        if (Object.keys(hourMap).length === 0) {
            return res.status(200).json({ peakHour: "No data", orderCount: 0 });
        }
        
        let maxHour = -1;
        let maxCount = -1;
        for (const [hrStr, count] of Object.entries(hourMap)) {
            const hr = parseInt(hrStr, 10);
            if (count > maxCount) {
                maxCount = count;
                maxHour = hr;
            }
        }
        
        const format12Hour = (h) => {
            if (h === 0) return '12 AM';
            if (h === 12) return '12 PM';
            if (h > 12) return `${h - 12} PM`;
            return `${h} AM`;
        };
        
        const startH = format12Hour(maxHour);
        const endH = format12Hour((maxHour + 1) % 24);
        
        res.status(200).json({
            peakHour: `${startH} - ${endH}`,
            orderCount: maxCount
        });
    } catch (err) {
        console.error("Analytics fetch failed", err);
        res.status(500).json({ error: "Failed to fetch peak time" });
    }
};

const getLowStock = async (req, res) => {
    try {
        const snap = await db.collection('ingredients').get();
        const lowItems = [];
        
        snap.docs.forEach(doc => {
            const data = doc.data();
            const qty = data.quantity || 0;
            const threshold = data.lowThreshold || 0;
            if (qty <= threshold) {
                lowItems.push({
                    name: data.name,
                    quantity: qty,
                    unit: data.unit,
                    threshold: threshold
                });
            }
        });
        
        lowItems.sort((a, b) => a.quantity - b.quantity);
        const top5 = lowItems.slice(0, 5);
        
        res.status(200).json(top5);
    } catch (err) {
        console.error("Analytics fetch failed", err);
        res.status(500).json({ error: "Failed to fetch low stock" });
    }
};

module.exports = {
    getSummary,
    getTopItems,
    getIngredientUsage,
    getOrderStatus,
    getPeakTime,
    getLowStock
};
