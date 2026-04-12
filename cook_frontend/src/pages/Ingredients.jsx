import { useState, useEffect } from 'react';
import { getIngredients, addIngredient, updateIngredient, deleteIngredient, getIngredientUsage } from '../services/api';
import { AlertTriangle, Search, Filter, Plus, TrendingUp, CheckCircle, Package, RefreshCw, Trash2 } from 'lucide-react';

const QtyStepper = ({ initialValue, onUpdate }) => {
  const [val, setVal] = useState(initialValue);

  // Sync incoming changes (e.g. from polling) if different
  useEffect(() => {
    setVal(initialValue);
  }, [initialValue]);

  const commitChange = (newValue) => {
    if (newValue < 0) newValue = 0;
    setVal(newValue);
    if (newValue !== initialValue) {
      onUpdate(newValue);
    }
  };

  const handleBlur = () => {
    let parsed = parseFloat(val);
    if (isNaN(parsed) || parsed < 0) parsed = 0;
    commitChange(parsed);
  };

  return (
    <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg p-1 w-max">
      <button 
        onClick={() => commitChange(parseFloat(val) - 1)} 
        className="w-7 h-7 flex justify-center items-center bg-white text-gray-600 font-bold rounded shadow-sm hover:bg-gray-100 transition-colors"
      >
        -
      </button>
      <input 
        type="number" 
        value={val} 
        onChange={e => setVal(e.target.value)} 
        onBlur={handleBlur}
        className="w-12 text-center text-sm font-bold bg-transparent outline-none appearance-none" 
      />
      <button 
        onClick={() => commitChange(parseFloat(val) + 1)} 
        className="w-7 h-7 flex justify-center items-center bg-white text-gray-600 font-bold rounded shadow-sm hover:bg-gray-100 transition-colors"
      >
        +
      </button>
    </div>
  );
};

export default function Ingredients() {
  const [ingredients, setIngredients] = useState([]);
  const [usage, setUsage] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ name: '', quantity: '', unit: 'kg', lowThreshold: '' });
  const [successMsg, setSuccessMsg] = useState("");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchData = async () => {
    try {
      const [ingRes, useRes] = await Promise.all([getIngredients(), getIngredientUsage()]);
      setIngredients(ingRes);
      setUsage(useRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const qty = parseFloat(form.quantity);
    const lowThr = parseFloat(form.lowThreshold || 0);

    if (!form.name || isNaN(qty) || qty < 0 || lowThr < 0) return;
    
    try {
      await addIngredient({ ...form, quantity: qty, lowThreshold: lowThr });
      setForm({ name: '', quantity: '', unit: 'kg', lowThreshold: '' });
      setSuccessMsg("✅ Ingredient added successfully");
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdjustExact = async (id, newQty) => {
    try {
      await updateIngredient(id, { quantity: newQty });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this ingredient?")) {
      try {
        await deleteIngredient(id);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) return <div className="p-8 text-gray-500 font-semibold tracking-tight text-center">Loading Data...</div>;

  // DERIVED DATA
  // 1. Low Stock Alerts
  const lowStockItems = ingredients.filter(i => {
    const thresh = i.lowThreshold || 0;
    return i.quantity <= thresh;
  });

  // 2. Consumption Cards (Map usage to ingredients to get progress)
  const usageWithLimits = usage.map(u => {
    const ing = ingredients.find(i => i.name.toLowerCase() === u.name.toLowerCase());
    const available = ing ? ing.quantity : 0;
    const total = u.totalUsed + available;
    const percent = total > 0 ? (u.totalUsed / total) * 100 : 0;
    
    let statusColor = "bg-green-500";
    if (percent > 80) statusColor = "bg-red-500";
    else if (percent > 50) statusColor = "bg-yellow-500";
    
    return { ...u, percent, statusColor };
  });

  // 3. Most Used Today
  const topUsed = [...usage].sort((a,b) => b.totalUsed - a.totalUsed).slice(0, 3);

  // 4. Search and Filter
  const filteredIngredients = ingredients.filter(ing => {
    const matchesSearch = ing.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
    const thresh = ing.lowThreshold || 0;
    let matchesFilter = true;
    
    if (filter === 'in-stock') matchesFilter = ing.quantity > thresh;
    else if (filter === 'low') matchesFilter = ing.quantity <= thresh && ing.quantity > 0;
    else if (filter === 'out') matchesFilter = ing.quantity <= 0;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-[1600px] mx-auto pb-10 space-y-6">
      
      <div className="mb-4">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Smart Inventory</h1>
        <p className="text-sm font-medium text-gray-500 mt-1">Real-time tracking and analytics</p>
      </div>

      {/* ⚠ LOW STOCK ALERTS (TOP PRIORITY) */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" /> Low Stock Alerts
        </h2>
        {lowStockItems.length === 0 ? (
          <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm font-bold text-green-700">All ingredients are sufficient ✅</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {lowStockItems.map(item => {
              const isCritical = item.quantity <= 0;
              return (
                <div key={item.id} className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${isCritical ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
                  <div className="flex justify-between items-start">
                    <span className={`text-sm font-bold tracking-tight ${isCritical ? 'text-red-900' : 'text-yellow-900'}`}>{item.name}</span>
                    <span className={`text-[10px] uppercase tracking-wider font-black px-2 py-0.5 rounded shadow-sm ${isCritical ? 'bg-red-600 text-white' : 'bg-yellow-500 text-white'}`}>
                      {isCritical ? 'Critical' : 'Low'}
                    </span>
                  </div>
                  <div>
                    <span className={`text-2xl font-black ${isCritical ? 'text-red-600' : 'text-yellow-600'}`}>{item.quantity}</span>
                    <span className={`text-xs font-bold uppercase ml-1 ${isCritical ? 'text-red-400' : 'text-yellow-500'}`}>{item.unit} left</span>
                  </div>
                  <button className={`w-full py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-colors shadow-sm flex justify-center items-center gap-1.5 ${isCritical ? 'bg-white text-red-700 border-red-200 hover:bg-red-100' : 'bg-white text-yellow-700 border-yellow-200 hover:bg-yellow-100'}`}>
                    <RefreshCw className="w-3.5 h-3.5" /> Restock
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 📊 TODAY'S CONSUMPTION */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-500" /> Today's Consumption
          </h2>
          {usageWithLimits.length === 0 ? (
            <p className="text-sm font-semibold text-gray-400 py-4 italic">No consumption data yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {usageWithLimits.map(u => (
                <div key={u.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-gray-700">{u.name}</span>
                    <span className="text-xs font-black text-gray-900">{u.totalUsed} used</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden shadow-inner">
                    <div className={`h-2 rounded-full ${u.statusColor} transition-all duration-500`} style={{ width: `${Math.min(u.percent, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 🔥 MOST USED TODAY */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" /> Most Used Today
          </h2>
          {topUsed.length === 0 ? (
            <p className="text-sm font-semibold text-gray-400 py-4 italic">No usage recorded.</p>
          ) : (
            <div className="space-y-3">
              {topUsed.map((u, i) => (
                <div key={u.id} className="flex justify-between items-center p-3.5 bg-orange-50/50 rounded-xl border border-orange-100">
                  <span className="flex items-center gap-3 font-bold text-sm text-gray-900">
                    <span className="w-6 h-6 flex justify-center items-center bg-orange-500 text-white rounded-md text-xs">{i+1}</span>
                    {u.name}
                  </span>
                  <span className="text-xs font-black bg-white px-2 py-1 rounded shadow-sm text-orange-700 border border-orange-200">
                    {u.totalUsed} items
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ➕ ADD NEW INGREDIENT */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-green-500" /> Add Ingredient
        </h2>
        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm font-bold rounded-xl border border-green-200 shadow-sm flex items-center gap-2">
            {successMsg}
          </div>
        )}
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <label className="md:col-span-2">
            <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Ingredient Name</span>
            <input className="w-full border border-gray-200 p-3 rounded-xl font-medium focus:ring-2 focus:ring-green-400 outline-none shadow-sm transition-all" placeholder="e.g. Olive Oil" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required/>
          </label>
          <label>
            <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Qty Stock</span>
            <input type="number" step="0.01" min="0" className="w-full border border-gray-200 p-3 rounded-xl font-medium focus:ring-2 focus:ring-green-400 outline-none shadow-sm transition-all" placeholder="e.g. 5" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} required/>
          </label>
          <div className="flex gap-4">
            <label className="flex-1">
              <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Unit</span>
              <select className="w-full border border-gray-200 p-3 rounded-xl bg-white font-medium focus:ring-2 focus:ring-green-400 outline-none shadow-sm transition-all" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}>
                <option value="kg">kg</option>
                <option value="liter">liter</option>
                <option value="unit">unit</option>
              </select>
            </label>
            <label className="flex-1">
              <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Low Warn</span>
              <input type="number" step="0.01" min="0" className="w-full border border-gray-200 p-3 rounded-xl font-medium focus:ring-2 focus:ring-green-400 outline-none shadow-sm transition-all" placeholder="e.g. 1" value={form.lowThreshold} onChange={e => setForm({...form, lowThreshold: e.target.value})}/>
            </label>
          </div>
          <button className="bg-gray-900 hover:bg-black text-white font-bold h-[50px] rounded-xl transition-all shadow-sm flex justify-center items-center gap-2">
            <Plus className="w-4 h-4" /> Add
          </button>
        </form>
      </div>

      {/* 📦 INVENTORY TABLE */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden">
        
        {/* Search & Filter Top Bar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search ingredients..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 shadow-sm text-sm font-medium"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-gray-400" />
            <select 
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="bg-white border border-gray-200 text-sm font-bold py-2 px-3 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 outline-none flex-1 sm:flex-none"
            >
              <option value="all">All Items</option>
              <option value="in-stock">🟢 In Stock</option>
              <option value="low">🟡 Low Stock</option>
              <option value="out">🔴 Out of Stock</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-white border-b border-gray-100 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                        <th className="p-4 px-6 pt-5">Ingredient</th>
                        <th className="p-4 pt-5">Available Stock</th>
                        <th className="p-4 pt-5">Adjust</th>
                        <th className="p-4 pt-5">Status</th>
                        <th className="p-4 pt-5 text-right px-6">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/50">
                    {filteredIngredients.map(ing => {
                      const isLow = ing.quantity <= (ing.lowThreshold || 0) && ing.quantity > 0;
                      const isOut = ing.quantity <= 0;
                      const isOk = ing.quantity > (ing.lowThreshold || 0);

                      let badge = null;
                      if (isOk) badge = <span className="bg-green-100 text-green-700 font-bold px-2.5 py-1 rounded-lg text-[10px] tracking-wider uppercase border border-green-200">In Stock</span>;
                      if (isLow) badge = <span className="bg-yellow-100 text-yellow-700 font-bold px-2.5 py-1 rounded-lg text-[10px] tracking-wider uppercase border border-yellow-200">Low Stock</span>;
                      if (isOut) badge = <span className="bg-red-100 text-red-700 font-bold px-2.5 py-1 rounded-lg text-[10px] tracking-wider uppercase border border-red-200">Out of Stock</span>;

                      return (
                          <tr key={ing.id} className="hover:bg-gray-50 transition-colors group">
                              <td className="p-4 px-6 font-bold text-gray-900">{ing.name}</td>
                              <td className="p-4 font-black text-gray-700 text-lg">{ing.quantity} <span className="text-gray-400 font-bold text-sm tracking-tight">{ing.unit}</span></td>
                              <td className="p-4">
                                <QtyStepper initialValue={ing.quantity} onUpdate={(val) => handleAdjustExact(ing.id, val)} />
                              </td>
                              <td className="p-4">{badge}</td>
                              <td className="p-4 px-6 text-right cursor-pointer">
                                 <button onClick={() => handleDelete(ing.id)} className="w-8 h-8 flex justify-center items-center rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors text-gray-400 float-right mr-2 md:opacity-0 group-hover:opacity-100">
                                   <Trash2 className="w-4 h-4" />
                                 </button>
                              </td>
                          </tr>
                      );
                    })}
                    {filteredIngredients.length === 0 && (
                        <tr>
                            <td colSpan="5" className="p-12 text-center text-gray-500 font-bold">No ingredients found matching your search.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
