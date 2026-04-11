import { useState, useEffect } from 'react';
import { 
  getAnalyticsSummary, 
  getAnalyticsTopItems, 
  getAnalyticsUsage, 
  getAnalyticsStatus, 
  getAnalyticsPeakTime, 
  getAnalyticsLowStock 
} from '../services/api';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchData = async () => {
    try {
      const [summary, topItems, usage, status, peakTime, lowStock] = await Promise.all([
        getAnalyticsSummary(),
        getAnalyticsTopItems(),
        getAnalyticsUsage(),
        getAnalyticsStatus(),
        getAnalyticsPeakTime(),
        getAnalyticsLowStock()
      ]);

      setData({
        summary,
        topItems,
        usage,
        status,
        peakTime,
        lowStock
      });
    } catch (err) {
      console.error("Analytics fetch failed", err);
    } finally {
      if (loading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return <div className="p-8 text-center text-gray-500 font-bold tracking-wider uppercase text-sm">Loading analytics...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-red-500 font-bold tracking-wider uppercase text-sm">No data available today</div>;
  }

  // Formatting helpers
  const formatCurrency = (val) => `₹ ${(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

  return (
    <div className="max-w-6xl mx-auto pb-10 space-y-6">
      <h1 className="text-2xl font-black text-gray-900 tracking-tight">Daily Analytics</h1>

      {/* SECTION 1: TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <h2 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Total Orders</h2>
          <div className="text-4xl font-black text-gray-900 tracking-tighter">{data.summary.totalOrders}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <h2 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Total Revenue</h2>
          <div className="text-4xl font-black text-green-600 tracking-tighter">{formatCurrency(data.summary.totalRevenue)}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <h2 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Avg Order Value</h2>
          <div className="text-4xl font-black text-blue-600 tracking-tighter">{formatCurrency(data.summary.avgOrderValue)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SECTION 2: TOP SELLING ITEMS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4 tracking-tight">Top Selling Items</h2>
          {data.topItems.length === 0 ? (
            <p className="text-sm text-gray-500 font-medium">No items sold today.</p>
          ) : (
            <div className="space-y-3">
              {data.topItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="font-bold text-gray-800">{item.name}</span>
                  <div className="text-right">
                    <span className="block text-sm font-black text-gray-900">{item.count} <span className="opacity-60 text-xs tracking-wider uppercase font-bold">orders</span></span>
                    <span className="block text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md mt-1 inline-block border border-blue-100 uppercase tracking-wide">Qty: {item.totalQuantity}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 3: INGREDIENT USAGE */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <h2 className="text-lg font-bold text-gray-900 mb-4 tracking-tight">Ingredient Usage</h2>
           {data.usage.length === 0 ? (
              <p className="text-sm text-gray-500 font-medium">No ingredients used today.</p>
           ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {data.usage.map((ing, idx) => (
                   <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col justify-center items-center text-center">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 truncate w-full">{ing.name}</span>
                      <span className="text-2xl font-black text-gray-900 tracking-tighter">{ing.used} <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{ing.unit}</span></span>
                   </div>
                ))}
              </div>
           )}
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* SECTION 4: LOW STOCK ALERT */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100">
          <h2 className="text-lg font-bold text-red-600 mb-4 tracking-tight flex items-center gap-2">
            <span>⚠️ Low Stock Alerts</span>
          </h2>
          {data.lowStock.length === 0 ? (
            <p className="text-sm text-green-600 font-bold tracking-tight">All stocks are optimal.</p>
          ) : (
            <div className="space-y-3">
              {data.lowStock.map((ing, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm font-semibold p-3 bg-red-50 text-red-800 rounded-xl border border-red-100">
                  <span className="truncate pr-2 font-bold">{ing.name}</span>
                  <span className="font-black bg-white px-2 py-1 rounded-lg text-xs border border-red-100">{ing.quantity} {ing.unit}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 5: ORDER STATUS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <h2 className="text-lg font-bold text-gray-900 mb-4 tracking-tight">Order Status</h2>
           <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center"><span className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-0.5">Pending</span><span className="font-black text-xl tracking-tighter">{data.status.pending}</span></div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center"><span className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-0.5">Accepted</span><span className="font-black text-xl tracking-tighter">{data.status.accepted}</span></div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex flex-col items-center"><span className="text-blue-500 text-xs font-bold uppercase tracking-wider mb-0.5">Preparing</span><span className="font-black text-xl text-blue-700 tracking-tighter">{data.status.preparing}</span></div>
              <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-100 flex flex-col items-center"><span className="text-yellow-600 text-xs font-bold uppercase tracking-wider mb-0.5">Ready</span><span className="font-black text-xl text-yellow-700 tracking-tighter">{data.status.ready}</span></div>
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex flex-col items-center"><span className="text-purple-500 text-xs font-bold uppercase tracking-wider mb-0.5">Delivery</span><span className="font-black text-xl text-purple-700 tracking-tighter">{data.status.out_for_delivery}</span></div>
              <div className="p-3 bg-green-50 rounded-xl border border-green-100 flex flex-col items-center"><span className="text-green-500 text-xs font-bold uppercase tracking-wider mb-0.5">Delivered</span><span className="font-black text-xl text-green-700 tracking-tighter">{data.status.delivered}</span></div>
           </div>
        </div>

        {/* SECTION 6: PEAK TIME */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
           <h2 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">Peak Time Output</h2>
           <div className="flex flex-col items-center justify-center flex-1 w-full p-4 bg-gray-50 rounded-xl border border-gray-100 mt-2">
              <span className="block text-3xl font-black text-blue-600 tracking-tighter">{data.peakTime.peakHour}</span>
              <span className="block text-xs font-bold text-gray-500 uppercase tracking-widest mt-2 px-3 py-1 bg-white rounded-lg border border-gray-200">{data.peakTime.orderCount} Orders</span>
           </div>
        </div>

      </div>
    </div>
  );
}
