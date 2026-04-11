import { useState, useEffect } from 'react';
import { getIngredients, addIngredient, updateIngredient, deleteIngredient, getIngredientUsage } from '../services/api';

export default function Ingredients() {
  const [ingredients, setIngredients] = useState([]);
  const [usage, setUsage] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ name: '', quantity: '', unit: 'kg', lowThreshold: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
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
    if (!form.name || !form.quantity || !form.unit) return;
    try {
      await addIngredient(form);
      setForm({ name: '', quantity: '', unit: 'kg', lowThreshold: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdjust = async (id, currentQty, amount) => {
    let newQty = currentQty + amount;
    if (newQty < 0) newQty = 0;
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

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <h1 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">Inventory & Analytics</h1>
      
      {/* Analytics Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4 tracking-tight">Today's Consumption</h2>
        {usage.length === 0 ? (
          <p className="text-gray-500 font-medium">No ingredients used today yet.</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {usage.map(u => (
              <div key={u.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 shadow-inner">
                <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">{u.name}</div>
                <div className="text-2xl font-black text-green-600 tracking-tighter mt-1">{u.totalUsed} <span className="text-sm font-bold opacity-80 uppercase">USED</span></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4 tracking-tight">Add New Ingredient</h2>
        <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 md:items-end">
          <label className="flex-1">
            <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Ingredient Name</span>
            <input className="w-full border border-gray-200 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-green-400 outline-none" placeholder="e.g. Tomato" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required/>
          </label>
          <label className="w-full md:w-32">
            <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Qty Stock</span>
            <input type="number" step="0.01" className="w-full border border-gray-200 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-green-400 outline-none" placeholder="e.g. 5" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} required/>
          </label>
          <label className="w-full md:w-28">
            <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Unit</span>
            <select className="w-full border border-gray-200 p-2.5 rounded-xl bg-white font-medium focus:ring-2 focus:ring-green-400 outline-none" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}>
              <option value="kg">kg</option>
              <option value="liter">liter</option>
              <option value="unit">unit</option>
            </select>
          </label>
          <label className="w-full md:w-32">
            <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Low Warning</span>
            <input type="number" step="0.01" className="w-full border border-gray-200 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-green-400 outline-none" placeholder="e.g. 1" value={form.lowThreshold} onChange={e => setForm({...form, lowThreshold: e.target.value})}/>
          </label>
          <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-sm active:scale-95 w-full md:w-auto">Add</button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <th className="p-4 px-6">Ingredient</th>
                        <th className="p-4">Available Stock</th>
                        <th className="p-4">Adjust</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right px-6">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {ingredients.map(ing => (
                        <tr key={ing.id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="p-4 px-6 font-bold text-gray-900 tracking-tight">{ing.name}</td>
                            <td className="p-4 font-bold text-gray-700">{ing.quantity} <span className="text-gray-400 font-medium ml-0.5">{ing.unit}</span></td>
                            <td className="p-4">
                               <div className="flex items-center gap-1.5">
                                 <button onClick={() => handleAdjust(ing.id, ing.quantity, -1)} className="w-8 h-8 flex justify-center items-center bg-gray-100 text-gray-600 font-bold rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors">-</button>
                                 <button onClick={() => handleAdjust(ing.id, ing.quantity, 1)} className="w-8 h-8 flex justify-center items-center bg-gray-100 text-gray-600 font-bold rounded-lg hover:bg-green-100 hover:text-green-600 transition-colors">+</button>
                               </div>
                            </td>
                            <td className="p-4">
                               {ing.quantity <= ing.lowThreshold && <span className="bg-red-100 font-bold text-red-600 px-2.5 py-1 rounded-md text-xs tracking-tight border border-red-200">⚠️ Low Stock</span>}
                               {ing.quantity > ing.lowThreshold && <span className="text-gray-400 text-sm font-semibold tracking-tight">OK</span>}
                            </td>
                            <td className="p-4 px-6 text-right">
                               <button onClick={() => handleDelete(ing.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 font-bold px-3 py-1.5 rounded-lg border border-transparent transition-all md:opacity-0 group-hover:opacity-100 text-sm">Delete</button>
                            </td>
                        </tr>
                    ))}
                    {ingredients.length === 0 && (
                        <tr>
                            <td colSpan="5" className="p-8 text-center text-gray-500 font-medium">No ingredients added yet.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
