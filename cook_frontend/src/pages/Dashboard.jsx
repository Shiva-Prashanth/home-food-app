import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  getOrders, 
  getKitchenStatus, 
  updateKitchenStatus, 
  getIngredients, 
  getAnalyticsSummary, 
  getAnalyticsStatus, 
  getAnalyticsLowStock 
} from '../services/api';
import { ShoppingBag, Clock, CheckCircle, DollarSign, ArrowRight, Activity, AlertTriangle, TrendingUp, Bell } from 'lucide-react';

export default function Dashboard({ setIsSidebarOpen }) {
  const navigate = useNavigate();
  const [data, setData] = useState({
    orders: [],
    kitchenStatus: 'low',
    summary: null,
    statusCounts: null,
    lowStock: []
  });
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusSuccess, setStatusSuccess] = useState(false);

  const fetchAllDashboardData = async () => {
    try {
      const results = await Promise.allSettled([
        getOrders(),
        getKitchenStatus(),
        getAnalyticsSummary(),
        getAnalyticsStatus(),
        getAnalyticsLowStock()
      ]);

      const fetchedOrders = results[0].status === 'fulfilled' ? results[0].value : [];
      const kitchenStatusObj = results[1].status === 'fulfilled' ? results[1].value : { status: 'low' };
      
      let summary = results[2].status === 'fulfilled' && results[2].value ? results[2].value : null;
      if (!summary) {
        summary = {
          totalOrders: fetchedOrders.length,
          totalRevenue: fetchedOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0),
          avgOrderValue: fetchedOrders.length ? (fetchedOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0) / fetchedOrders.length) : 0
        };
      }

      let statusCounts = results[3].status === 'fulfilled' && results[3].value ? results[3].value : null;
      if (!statusCounts) {
        statusCounts = { pending: 0, accepted: 0, preparing: 0, ready: 0, out_for_delivery: 0, delivered: 0 };
        fetchedOrders.forEach(o => {
          const s = normalizeStatus(o.status);
          if (statusCounts[s] !== undefined) statusCounts[s]++;
        });
      }

      let lowStock = results[4].status === 'fulfilled' && results[4].value ? results[4].value : null;
      if (!lowStock) {
        try {
          const allIngs = await getIngredients();
          lowStock = allIngs.filter(ing => ing.quantity <= (ing.lowThreshold || 0)).slice(0, 5);
        } catch (e) {
          lowStock = [];
        }
      }

      setData({
        orders: fetchedOrders,
        kitchenStatus: kitchenStatusObj.status,
        summary,
        statusCounts,
        lowStock
      });
    } catch (err) {
      console.error("Dashboard fetch failed", err);
    } finally {
      if (loading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDashboardData();
    const interval = setInterval(() => {
      fetchAllDashboardData();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (newStatus) => {
    if (newStatus === data.kitchenStatus || statusUpdating) return;
    setStatusUpdating(true);
    setStatusSuccess(false);
    try {
      const res = await updateKitchenStatus(newStatus);
      setData(prev => ({ ...prev, kitchenStatus: res.status }));
      setStatusSuccess(true);
      setTimeout(() => setStatusSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setStatusUpdating(false);
    }
  };

  const normalizeStatus = (status) => (status ? status.toLowerCase() : 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 h-[75vh]">
        <p className="text-gray-500 text-lg font-bold animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  const { orders, kitchenStatus, summary, statusCounts, lowStock } = data;

  let completionTimes = [];
  orders.forEach(o => {
    if (o.status === 'delivered' || o.status === 'ready' || o.status === 'out_for_delivery') {
      completionTimes.push(18); 
    }
  });
  const avgPrepMins = completionTimes.length > 0 ? Math.round(completionTimes.reduce((a,b)=>a+b, 0) / completionTimes.length) : 18;

  const pendingOrders = orders.filter(o => ['pending', 'accepted', 'preparing'].includes(normalizeStatus(o.status)));
  let nextDeliveryTxt = "No pending deliveries";
  if (pendingOrders.length > 0) {
    pendingOrders.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
    const earliest = new Date(pendingOrders[0].createdAt);
    const estDelivery = new Date(earliest.getTime() + avgPrepMins * 60000);
    const diffMins = Math.round((estDelivery - new Date()) / 60000);
    if (diffMins < 0) nextDeliveryTxt = 'Due now';
    else nextDeliveryTxt = `${diffMins} mins`;
  }

  const delayEstimates = {
    low: "All good",
    medium: "Slight delay ⚠️",
    high: "Heavy delay 🚨"
  };

  const activeOrdersCount = orders.filter(o => normalizeStatus(o.status) !== 'delivered').length;

  const sortedOrders = [...orders].sort((a,b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp));
  const recentOrders = sortedOrders.slice(0, 3);

  const getSortTime = (o, i) => {
    if (o.updatedAt) return new Date(o.updatedAt).getTime();
    if (o.timestamp) return new Date(o.timestamp).getTime();
    if (o.createdAt) return new Date(o.createdAt).getTime();
    return new Date().getTime() - i; 
  };
  
  const feedOrders = [...orders].sort((a,b) => getSortTime(b, orders.indexOf(b)) - getSortTime(a, orders.indexOf(a))).slice(0, 5);

  const formatFeedStatus = (status) => {
    const s = normalizeStatus(status);
    if (s === 'out_for_delivery') return 'Out for Delivery';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  let itemStats = {};
  orders.forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        const name = item.name || "Unknown Item";
        const qty = item.quantity || 1;
        if (!itemStats[name]) itemStats[name] = 0;
        itemStats[name] += qty;
      });
    }
  });
  const topItems = Object.entries(itemStats)
    .sort((a,b) => b[1] - a[1])
    .slice(0, 3)
    .map(entry => ({ name: entry[0], quantity: entry[1] }));

  const getStatusBadge = (status) => {
    const s = normalizeStatus(status);
    if (s === 'delivered') return 'bg-green-100 text-green-700 font-black border-green-200';
    if (s === 'preparing') return 'bg-blue-100 text-blue-700 font-black border-blue-200';
    if (s === 'ready') return 'bg-purple-100 text-purple-700 font-black border-purple-200';
    return 'bg-orange-100 text-orange-700 font-black border-orange-200';
  };
  
  const getStatusDot = (status) => {
    const s = normalizeStatus(status);
    if (s === 'delivered') return '🟢';
    if (s === 'preparing') return '🔵';
    if (s === 'ready') return '🟣';
    return '🟡';
  };

  const formatCurrency = (val) => `₹ ${(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  const completionRate = summary.totalOrders > 0 ? Math.round((statusCounts.delivered / summary.totalOrders) * 100) : 0;

  return (
    <div className="max-w-[1600px] mx-auto pb-10 space-y-5">
      
      {/* 1. KITCHEN STATUS BAR */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h2 className="text-[17px] font-black text-gray-900 tracking-tight flex items-center gap-2">
            {kitchenStatus === 'low' ? '🟢 Kitchen Open (Low)' : kitchenStatus === 'medium' ? '🟡 Kitchen Busy (Medium)' : '🔴 Kitchen Overwhelmed (High)'}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-gray-700">
            <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-gray-400" /> {activeOrdersCount} Active Orders</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gray-400" /> Avg Prep: {avgPrepMins} mins</span>
            <span className="flex items-center gap-1.5 whitespace-nowrap"><ShoppingBag className="w-4 h-4 text-gray-400" /> Next Delivery: {nextDeliveryTxt}</span>
            <span className={`flex items-center gap-1.5 ${kitchenStatus !== 'low' ? 'text-red-500 font-bold' : 'text-green-600 font-bold'}`}>
              Alert: {delayEstimates[kitchenStatus]}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-gray-50 p-2 rounded-xl">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Set Status:</span>
          <div className="flex items-center gap-2">
            {['low', 'medium', 'high'].map(level => {
              const isActive = kitchenStatus === level;
              const colorClass = level === 'low' ? 'bg-green-100 text-green-700 border-green-200' :
                                  level === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                  'bg-red-100 text-red-700 border-red-200';
              return (
                <button
                  key={level}
                  disabled={statusUpdating}
                  onClick={() => handleStatusUpdate(level)}
                  className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider border-2 transition-all shadow-sm
                    ${isActive ? colorClass + ' ring-2 ring-gray-400 shadow-md ring-offset-1 z-10' : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-100'}
                    ${statusUpdating ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {statusUpdating && isActive ? '...' : level}
                </button>
              )
            })}
          </div>
          {statusSuccess && <CheckCircle className="w-5 h-5 text-green-500 animate-pulse ml-1" />}
        </div>
      </div>

      {/* 2. KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex justify-center items-center"><ShoppingBag className="w-6 h-6" /></div>
          <div>
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Orders</h3>
            <div className="text-2xl font-black text-gray-900 mt-0.5">{summary.totalOrders}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 relative overflow-hidden">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex justify-center items-center"><Clock className="w-6 h-6" /></div>
          <div>
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Active Orders</h3>
            <div className="text-2xl font-black text-gray-900 mt-0.5">{activeOrdersCount}</div>
            {activeOrdersCount > 5 && <span className="absolute top-4 right-4 text-[9px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-md uppercase tracking-wider border border-red-200">🔥 Peak Time</span>}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex justify-center items-center"><CheckCircle className="w-6 h-6" /></div>
          <div>
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Completed</h3>
            <div className="text-2xl font-black text-gray-900 mt-0.5">{statusCounts.delivered}</div>
            <p className="text-[10px] font-black text-green-500 mt-1 uppercase tracking-wider">✔ {completionRate}% Completion Rate</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex justify-center items-center"><DollarSign className="w-6 h-6" /></div>
          <div>
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Earnings</h3>
            <div className="text-2xl font-black text-purple-600 mt-0.5">{formatCurrency(summary.totalRevenue)}</div>
            <p className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-wider">💰 Avg Order = {formatCurrency(summary.avgOrderValue)}</p>
          </div>
        </div>

      </div>

      {/* 3. MIDDLE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Live Activity Feed */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
          <h2 className="text-[15px] font-bold text-gray-900 mb-5 tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-500" /> Live Activity
          </h2>
          <div className="flex-1">
            {feedOrders.length === 0 ? (
              <p className="text-[13px] font-semibold text-gray-400 py-8 text-center italic">No recent activity</p>
            ) : (
              <ul className="space-y-3">
                {feedOrders.map((o, idx) => (
                  <li key={`${o.id}-${idx}`} className="flex items-center gap-3 text-[13px] font-semibold text-gray-800 bg-gray-50/80 p-3.5 rounded-xl border border-gray-100">
                    <span className="animate-pulse bg-green-500 w-2 h-2 rounded-full hidden sm:block shadow-sm"></span>
                    <span>
                      🔔 Order #{o.id.slice(0,5).toUpperCase()} is now <span className={`uppercase font-black tracking-widest text-[10px] px-2 py-0.5 ml-1 rounded-md border ${getStatusBadge(o.status)}`}>{formatFeedStatus(o.status)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
          <h2 className="text-[15px] font-bold text-gray-900 mb-5 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" /> Top Selling Items
          </h2>
          <div className="flex-1">
            {topItems.length === 0 ? (
              <p className="text-[13px] font-semibold text-gray-400 py-8 text-center italic">No sales today</p>
            ) : (
              <ol className="space-y-3">
                {topItems.map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                    <span className="font-bold text-gray-900 text-[14px] flex items-center gap-3">
                      <span className="bg-blue-600 shadow-sm text-white w-5 h-5 rounded flex items-center justify-center text-[10px] font-black">{idx + 1}</span> 
                      {item.name}
                    </span>
                    <span className="text-[12px] font-black text-blue-700 bg-blue-100 px-2.5 py-1 rounded-lg uppercase tracking-wider">{item.quantity} orders</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

      </div>

      {/* 4. BOTTOM GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
          <h2 className="text-[15px] font-bold text-gray-900 mb-5 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" /> Low Stock Alerts
          </h2>
          <div className="flex-1">
            {lowStock.length === 0 ? (
              <p className="text-[13px] font-bold text-green-600 py-8 text-center">All ingredients are sufficient.</p>
            ) : (
              <ul className="space-y-3">
                {lowStock.map((ing, i) => {
                  const isCritical = ing.quantity <= ((ing.lowThreshold || 0) * 0.5);
                  return (
                    <li key={i} className={`flex justify-between items-center p-3.5 rounded-xl border text-[13px] font-bold ${isCritical ? 'bg-red-50/50 border-red-200 text-red-800' : 'bg-yellow-50/50 border-yellow-200 text-yellow-800'}`}>
                      <span className="flex items-center gap-2">{isCritical ? '🚨 Critical' : '⚠️ Low'} → {ing.name}</span>
                      <span className={`px-2 py-1 rounded-lg text-[11px] tracking-wider uppercase font-black border shadow-sm ${isCritical ? 'bg-white border-red-100 text-red-600' : 'bg-white border-yellow-100 text-yellow-700'}`}>{ing.quantity} {ing.unit} left</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[15px] font-bold text-gray-900 tracking-tight">Recent Orders</h2>
            <button onClick={() => navigate('/orders')} className="text-[11px] uppercase tracking-wider font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></button>
          </div>
          <div className="flex-1">
            {recentOrders.length === 0 ? (
              <p className="text-[13px] font-semibold text-gray-400 py-8 text-center italic">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map(o => (
                  <div key={o.id} className="p-4 bg-gray-50/50 border border-gray-100 rounded-xl flex justify-between items-center hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="text-[14px] font-bold text-gray-900 flex items-center gap-2">
                        {getStatusDot(o.status)} {formatFeedStatus(o.status)} <span className="text-gray-300">•</span> <span className="text-gray-600">{o.customer?.name || o.customerName || `Order #${o.id.slice(0,5)}`}</span>
                      </p>
                      <p className="text-[12px] font-bold text-gray-500 mt-1.5 flex items-center gap-2">
                        {formatCurrency(o.totalPrice)} <span className="text-gray-300">•</span> {o.items ? o.items.length : 0} items <span className="text-gray-300">•</span> {o.createdAt ? new Date(o.createdAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : 'Now'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
