import { useState } from 'react';
import { Clock, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

export default function OrderCard({ order, onStatusChange }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'pending': return 'preparing';
      case 'preparing': return 'ready';
      case 'ready': return 'out_for_delivery';
      case 'out_for_delivery': return 'delivered';
      default: return null;
    }
  };

  const getButtonText = (currentStatus) => {
    switch (currentStatus) {
      case 'pending': return 'Accept & Prepare';
      case 'preparing': return 'Mark Ready';
      case 'ready': return 'Out for Delivery 🚚';
      case 'out_for_delivery': return 'Mark Delivered';
      default: return null;
    }
  };

  const nextStatus = getNextStatus(order.status);
  const buttonText = getButtonText(order.status);

  const handleUpdate = async () => {
    if (!nextStatus) return;
    setIsUpdating(true);
    setErrorMsg(null);
    try {
      await onStatusChange(order.id, nextStatus);
    } catch (err) {
      setErrorMsg("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-3 border-b pb-2">
        <div className="flex flex-col gap-1">
          <span className="font-bold text-gray-900 text-lg">
            {order.customer?.name || order.customerName || `Order #${order.id.slice(0, 5)}`}
          </span>
          <span className={`px-2 py-0.5 w-max rounded-full text-xs font-semibold ${getPriorityColor(order.priority || 'medium')}`}>
            {order.status.toUpperCase()}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1 text-gray-500 text-xs">
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            <span>
              {order.createdAt || order.timestamp 
                ? new Date(order.createdAt || order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                : 'Just now'}
            </span>
          </div>
          <span className="font-bold text-green-700 text-sm mt-1">
            ${(order.totalPrice || 0).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4 mt-2">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <span className="text-gray-700">
              <span className="font-medium text-gray-900 mr-2">{item.quantity}x</span>
              {item.name}
            </span>
          </div>
        ))}
      </div>

      {errorMsg && (
        <div className="flex items-center gap-1 text-red-600 text-xs mt-2 bg-red-50 p-2 rounded-lg">
          <AlertCircle className="w-3 h-3" />
          <span>{errorMsg}</span>
        </div>
      )}

      {nextStatus && (
        <button
          onClick={handleUpdate}
          disabled={isUpdating}
          className="w-full mt-2 py-2 px-4 rounded-lg text-sm font-medium transition-colors bg-gray-50 hover:bg-green-50 text-gray-700 hover:text-green-700 flex items-center justify-center gap-2 border border-gray-200 hover:border-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          {isUpdating ? "Updating..." : buttonText}
        </button>
      )}
    </div>
  );
}
