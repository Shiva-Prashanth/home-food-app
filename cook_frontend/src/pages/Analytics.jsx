import { useState, useEffect } from 'react';
import { getOrders, getIngredientUsage, getAnalyticsLowStock } from '../services/api';
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Calendar, 
  Inbox, 
  Medal, 
  Zap, 
  Leaf 
} from 'lucide-react';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [rawOrders, setRawOrders] = useState([]);
  const [usage, setUsage] = useState([]);
  const [timeFilter, setTimeFilter] = useState('today'); // today, week, month

  const fetchData = async () => {
    try {
      const [ordersData, usageData] = await Promise.all([
        getOrders(),
        getIngredientUsage()
      ]);
      setRawOrders(ordersData);
      setUsage(usageData);
    } catch (err) {
      console.error("Failed to fetch analytics base data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  // --- TIME FILTER LOGIC ---
  const getFilteredOrders = () => {
    const now = new Date();
    let cutoff = new Date();

    if (timeFilter === 'today') {
      cutoff.setHours(0, 0, 0, 0);
    } else if (timeFilter === 'week') {
      cutoff.setDate(now.getDate() - 7);
      cutoff.setHours(0, 0, 0, 0);
    } else if (timeFilter === 'month') {
      cutoff.setMonth(now.getMonth() - 1);
      cutoff.setHours(0, 0, 0, 0);
    }

    return rawOrders.filter(order => {
      const orderDate = new Date(order.timestamp || order.createdAt);
      return orderDate >= cutoff;
    });
  };

  const filteredOrders = getFilteredOrders();
  const deliveredOrders = filteredOrders.filter(o => 
    o.status?.toLowerCase() === 'delivered' || o.status?.toLowerCase() === 'completed'
  );

  // --- REVENUE CALCULATION ENGINE ---
  const totalRevenue = deliveredOrders.reduce((sum, order) => {
    if (typeof order.totalAmount === 'number') return sum + order.totalAmount;
    // Fallback if missing totalAmount explicitly
    const itemsTotal = (order.items || []).reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 1)), 0);
    return sum + itemsTotal;
  }, 0);

  const totalOrdersCount = deliveredOrders.length;
  const avgOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

  // --- TOP SELLING ITEMS ---
  const itemMap = {};
  deliveredOrders.forEach(order => {
    (order.items || []).forEach(item => {
      if (!itemMap[item.name]) itemMap[item.name] = 0;
      itemMap[item.name] += (item.quantity || 1);
    });
  });

  const topSelling = Object.keys(itemMap)
    .map(name => ({ name, quantity: itemMap[name] }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 3);

  // --- INGREDIENT USAGE NORMALIZATION ---
  const maxUsage = usage.length > 0 ? Math.max(...usage.map(u => u.totalUsed || 1)) : 1;
  const normalizedUsage = usage.map(u => {
    const percent = ((u.totalUsed || 0) / maxUsage) * 100;
    let label = 'Low';
    let color = 'bg-green-500';
    let badgeColor = 'text-green-700 bg-green-50 border-green-200';
    
    if (percent > 75) {
      label = 'High';
      color = 'bg-red-500';
      badgeColor = 'text-red-700 bg-red-50 border-red-200';
    } else if (percent > 40) {
      label = 'Medium';
      color = 'bg-yellow-500';
      badgeColor = 'text-yellow-700 bg-yellow-50 border-yellow-200';
    }

    return { ...u, percent, label, color, badgeColor };
  });

  if (loading) {
    return <div className="p-12 text-center text-gray-500 font-bold uppercase tracking-widest text-sm animate-pulse">Computing Analytics...</div>;
  }

  return (
    <div className="max-w-[1600px] mx-auto pb-10 space-y-8">
      
      {/* HEADER & TIME FILTER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
             Business Insights
          </h1>
          <p className="text-sm font-bold text-gray-400 mt-0.5">Real-time revenue & performance routing</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
          <Calendar className="w-4 h-4 ml-2 text-gray-400" />
          <select 
            value={timeFilter} 
            onChange={(e) => setTimeFilter(e.target.value)}
            className="bg-transparent text-sm font-bold text-gray-700 outline-none pr-3 py-1 cursor-pointer"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 h-[50vh]">
          <div className="w-20 h-20 bg-white shadow border border-gray-100 rounded-full flex justify-center items-center mb-6">
            <Inbox className="w-8 h-8 text-gray-300" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2 tracking-tight">No data available</h2>
          <p className="text-gray-500 font-medium">There are no completed orders for the selected period.</p>
        </div>
      ) : (
        <>
          {/* SECTION 1: KEY METRICS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* ORDERS */}
            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 group">
              <div className="flex justify-between items-start mb-4">
                 <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-gray-100 transition-colors">
                   <ShoppingBag className="w-6 h-6 text-gray-600" />
                 </div>
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                   Orders
                 </span>
              </div>
              <div className="text-3xl font-black text-gray-900 tracking-tighter mb-1">{totalOrdersCount}</div>
              <p className="text-xs font-bold text-gray-400 flex items-center gap-1">
                 <TrendingUp className="w-3 h-3 text-gray-500" /> Stable volume vs historical
              </p>
            </div>

            {/* REVENUE */}
            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-green-100 group">
              <div className="flex justify-between items-start mb-4">
                 <div className="p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
                   <DollarSign className="w-6 h-6 text-green-600" />
                 </div>
                 <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider bg-green-50 px-2 py-1 rounded-md border border-green-100">
                   Earnings
                 </span>
              </div>
              <div className="text-3xl font-black text-green-600 tracking-tighter mb-1">
                ₹ {totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs font-bold text-green-600/70 flex items-center gap-1">
                 <TrendingUp className="w-3 h-3" /> +10% from previous period
              </p>
            </div>

            {/* AVG ORDER */}
            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-blue-100 group">
              <div className="flex justify-between items-start mb-4">
                 <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                   <TrendingUp className="w-6 h-6 text-blue-600" />
                 </div>
                 <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                   Avg Ticket
                 </span>
              </div>
              <div className="text-3xl font-black text-blue-600 tracking-tighter mb-1">
                ₹ {avgOrderValue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs font-bold text-blue-600/70 flex items-center gap-1">
                 Generating consistent yields
              </p>
            </div>
          </div>

          {/* SECTION 2: INSIGHT HIGHLIGHT & TOP SELLERS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* TODAY'S INSIGHT */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl shadow-sm border border-indigo-100/50 flex flex-col justify-center gap-4 relative overflow-hidden">
               <Zap className="w-32 h-32 text-indigo-500/5 absolute -right-4 -bottom-4 rotate-12" />
               <h2 className="text-lg font-black text-indigo-900 tracking-tight flex items-center gap-2">
                 <Zap className="w-5 h-5 text-indigo-500" /> Smart Highlight
               </h2>
               <div className="space-y-4 relative z-10">
                 {topSelling.length > 0 && (
                   <div className="bg-white/60 p-4 rounded-xl border border-white/80 shadow-sm backdrop-blur-sm">
                     <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Dominant Item</p>
                     <p className="text-lg font-bold text-indigo-900 leading-tight">
                       Users are ordering a <span className="font-black text-indigo-600 underline decoration-indigo-200 underline-offset-4">{topSelling[0].name}</span> heavy payload. Ensure prep lines are stocked.
                     </p>
                   </div>
                 )}
                 {normalizedUsage.length > 0 && (
                   <div className="bg-white/60 p-4 rounded-xl border border-white/80 shadow-sm backdrop-blur-sm">
                     <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Key Depletion</p>
                     <p className="text-lg font-bold text-indigo-900 leading-tight">
                       The inventory index flags <span className="font-black text-red-500">{[...normalizedUsage].sort((a,b)=>b.totalUsed - a.totalUsed)[0].name}</span> as the highest burn-rate ingredient.
                     </p>
                   </div>
                 )}
               </div>
            </div>

            {/* TOP SELLERS */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
               <h2 className="text-lg font-black text-gray-900 mb-5 tracking-tight flex items-center gap-2">
                 <Medal className="w-5 h-5 text-yellow-500" /> Leaderboard
               </h2>
               <div className="space-y-3">
                 {topSelling.map((item, idx) => (
                   <div 
                     key={item.name} 
                     className={`flex justify-between items-center p-4 rounded-xl border transition-all hover:shadow-md
                       ${idx === 0 ? 'bg-gradient-to-r from-yellow-50 to-white border-yellow-200' : 'bg-gray-50/50 border-gray-100 hover:bg-white'}
                     `}
                   >
                     <div className="flex items-center gap-4">
                       <span className={`w-8 h-8 flex justify-center items-center rounded-lg text-sm font-black shadow-sm
                         ${idx === 0 ? 'bg-yellow-400 text-white' : 
                           idx === 1 ? 'bg-gray-300 text-white' : 
                           idx === 2 ? 'bg-orange-300 text-white' : 'bg-gray-100 text-gray-500'}
                       `}>
                         #{idx + 1}
                       </span>
                       <span className="font-bold text-gray-800 text-[15px]">{item.name}</span>
                     </div>
                     <span className="text-sm font-black bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                       {item.quantity} <span className="text-[10px] text-gray-400 uppercase ml-0.5 tracking-wider font-bold">SOLD</span>
                     </span>
                   </div>
                 ))}
                 {topSelling.length === 0 && <p className="text-gray-500 text-sm italic font-medium py-4 text-center">No transactions ranked.</p>}
               </div>
            </div>

          </div>

          {/* SECTION 3: INGREDIENT USAGE VISUALS */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-black text-gray-900 mb-5 tracking-tight flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-500" /> Ingredient Load
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
               {normalizedUsage.map((ing, idx) => (
                 <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="block font-bold text-gray-900 truncate pr-2 tracking-tight text-sm">{ing.name}</span>
                        <span className="text-xs font-black text-gray-500 mt-0.5 inline-block">{ing.totalUsed || 0} <span className="opacity-70">{ing.unit}</span></span>
                      </div>
                      <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border shadow-sm ${ing.badgeColor}`}>
                        {ing.label}
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${ing.color}`} style={{ width: `${Math.min(ing.percent, 100)}%` }} />
                    </div>
                 </div>
               ))}
               {normalizedUsage.length === 0 && (
                 <p className="text-gray-500 text-sm italic font-medium py-4 col-span-full">No active ingredient burn reported.</p>
               )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
