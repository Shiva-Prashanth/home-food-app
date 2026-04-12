const orderService = require('../services/orderService');
const { db } = require('../firebase');

const getAllOrders = async (req, res) => {
    try {
        const orders = await orderService.fetchOrdersFromDB();
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching all orders: ", error);
        res.status(500).json({ error: 'Internal server error while fetching orders' });
    }
};

const getOrderById = async (req, res) => {
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

        const data = doc.data();
        res.status(200).json({
            id: doc.id,
            status: data.status || 'pending',
            items: data.items || [],
            totalPrice: data.totalPrice || data.totalAmount || 0,
            customerName: data.customerName || data.customer?.name || '',
            address: data.address || data.customer?.address || '',
            createdAt: data.createdAt || null
        });
    } catch (error) {
        console.error("Error fetching order by ID: ", error);
        res.status(500).json({ error: 'Internal server error while fetching order' });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = ['pending', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({ error: `Invalid status. Allowed values are: ${allowedStatuses.join(', ')}` });
        }

        const updatedOrder = await orderService.updateOrderStatusInDB(id, status);
        res.status(200).json(updatedOrder);
    } catch (error) {
        console.error(`Error updating status for order ${req.params.id}: `, error);
        if (error.message === 'Order not found') {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.status(500).json({ error: 'Internal server error while updating order status' });
    }
};

module.exports = {
    getAllOrders,
    getOrderById,
    updateOrderStatus
};
