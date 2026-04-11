const orderService = require('../services/orderService');

const getAllOrders = async (req, res) => {
    try {
        const orders = await orderService.fetchOrdersFromDB();
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching all orders: ", error);
        res.status(500).json({ error: 'Internal server error while fetching orders' });
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
    updateOrderStatus
};
