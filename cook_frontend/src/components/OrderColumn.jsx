import OrderCard from './OrderCard';

export default function OrderColumn({ column, orders, onStatusChange }) {
  const Icon = column.icon;
  
  return (
    <div className="flex flex-col">
      <div className={`${column.bgColor} rounded-xl p-3 mb-3 border border-gray-200`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${column.iconColor}`} />
            <h3 className={`font-semibold text-sm ${column.textColor}`}>{column.label}</h3>
          </div>
          <span className={`${column.bgColor} ${column.textColor} text-xs font-semibold px-2 py-0.5 rounded-full bg-white`}>
            {orders.length}
          </span>
        </div>
      </div>
      <div className="flex-1 space-y-3 min-h-[200px]">
        {orders.length > 0 ? (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={onStatusChange}
            />
          ))
        ) : (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
            <p className="text-sm text-gray-400">No orders</p>
          </div>
        )}
      </div>
    </div>
  );
}
