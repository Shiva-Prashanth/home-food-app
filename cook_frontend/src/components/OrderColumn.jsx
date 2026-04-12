import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import OrderCard from './OrderCard';

export default function OrderColumn({ column, orders, onStatusChange }) {
  const [showAll, setShowAll] = useState(false);
  const Icon = column.icon;

  const visibleOrders = showAll ? orders : orders.slice(0, 3);
  const remaining = orders.length - 3;

  return (
    <div className="flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit max-h-[800px]">
      
      {/* Sticky Header */}
      <div className={`sticky top-0 z-10 ${column.bgColor} p-4 border-b ${column.borderColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${column.iconColor}`} />
            <h3 className={`font-bold text-[15px] ${column.textColor}`}>{column.label}</h3>
          </div>
          <span className={`${column.bgColor} ${column.textColor} text-xs font-black px-2.5 py-1 rounded-full bg-white shadow-sm border ${column.borderColor}`}>
            {orders.length}
          </span>
        </div>
      </div>

      {/* Orders List Content */}
      <div className="flex-1 p-4 max-h-[500px] overflow-y-auto custom-scrollbar">
        {orders.length > 0 ? (
          <div className="flex flex-col gap-3 transition-all duration-300">
            {visibleOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50/50 mt-2">
            <p className="text-sm font-semibold text-gray-400">No orders</p>
          </div>
        )}
        
        {/* View More / Show Less Button */}
        {orders.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className={`mt-4 w-full py-2.5 flex items-center justify-center gap-1.5 text-xs font-bold rounded-xl transition-colors
              ${column.bgColor} ${column.textColor} border ${column.borderColor} hover:bg-white hover:border-gray-300`}
          >
            {showAll ? (
              <><ChevronUp className="w-4 h-4" /> Show Less</>
            ) : (
              <><ChevronDown className="w-4 h-4" /> View More (+{remaining})</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
