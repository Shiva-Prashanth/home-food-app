import { useState, useEffect } from 'react';
import OrderColumn from '../components/OrderColumn';
import { getOrders, updateOrderStatus } from '../services/api';
import { Clock, ChefHat, CheckCircle, Truck, Package } from 'lucide-react';

export default function Orders({ setIsSidebarOpen }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        const data = await getOrders();
        setOrders(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAllOrders();
    const interval = setInterval(fetchAllOrders, 10000); // auto-refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    await updateOrderStatus(orderId, newStatus);
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o)));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 h-[75vh]">
        <p className="text-gray-500 text-lg font-bold animate-pulse">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1600px] mx-auto pb-8">
        <div className="bg-red-50 text-red-600 p-5 rounded-2xl mb-8 border border-red-200 font-bold">
          <p>Failed to load orders: {error}</p>
        </div>
      </div>
    );
  }

  // Safe sorting - do not mutate original orders array
  const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp));

  // Pre-compute safely outside JSX
  const groupedOrders = {
    pending: sortedOrders.filter(o => o.status === 'pending'),
    preparing: sortedOrders.filter(o => o.status === 'preparing'),
    ready: sortedOrders.filter(o => o.status === 'ready'),
    out_for_delivery: sortedOrders.filter(o => o.status === 'out_for_delivery'),
    delivered: sortedOrders.filter(o => o.status === 'delivered')
  };

  const columns = [
    { status: 'pending', label: 'Pending', icon: Clock, bgColor: 'bg-orange-50', textColor: 'text-orange-700', iconColor: 'text-orange-600', borderColor: 'border-orange-200' },
    { status: 'preparing', label: 'Preparing', icon: ChefHat, bgColor: 'bg-blue-50', textColor: 'text-blue-700', iconColor: 'text-blue-600', borderColor: 'border-blue-200' },
    { status: 'ready', label: 'Ready', icon: CheckCircle, bgColor: 'bg-green-50', textColor: 'text-green-700', iconColor: 'text-green-600', borderColor: 'border-green-200' },
    { status: 'out_for_delivery', label: 'Delivery', icon: Truck, bgColor: 'bg-purple-50', textColor: 'text-purple-700', iconColor: 'text-purple-600', borderColor: 'border-purple-200' },
    { status: 'delivered', label: 'Delivered', icon: Package, bgColor: 'bg-gray-50', textColor: 'text-gray-700', iconColor: 'text-gray-600', borderColor: 'border-gray-200' },
  ];

  return (
    <div className="max-w-[1600px] mx-auto pb-8">
      
      <div className="mb-6 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Order Management</h1>
        <p className="text-gray-500 mt-1 font-medium">Control the kitchen workflow</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
        {columns.map(col => (
          <OrderColumn 
            key={col.status} 
            column={col} 
            orders={groupedOrders[col.status] || []} 
            onStatusChange={handleStatusChange} 
          />
        ))}
      </div>
    </div>
  );
}
