import { useState, useEffect } from 'react';
import MenuForm from '../components/MenuForm';
import MenuItemCard from '../components/MenuItemCard';
import { getMenu, addMenuItem, updateMenuItem, deleteMenuItem } from '../services/api';
import { Utensils } from 'lucide-react';

const CATEGORIES = ['All', 'Veg', 'Non-Veg', 'Diet', 'Beverages', 'Desserts', 'Snacks', 'Other'];

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const data = await getMenu();
      setMenuItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMenu(); }, []);

  const handleAddOrUpdate = async (formData) => {
    if (editingItem) {
      const updated = await updateMenuItem(editingItem.id, formData);
      setMenuItems(prev => prev.map(item => item.id === updated.id ? updated : item));
      setEditingItem(null);
    } else {
      const newItem = await addMenuItem(formData);
      setMenuItems(prev => [newItem, ...prev]);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Delete this menu item?')) return;
    await deleteMenuItem(itemId);
    setMenuItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleToggleAvailable = async (item) => {
    const updated = await updateMenuItem(item.id, { isAvailable: !item.isAvailable });
    setMenuItems(prev => prev.map(i => i.id === updated.id ? updated : i));
  };

  const handleToggleSpecial = async (item) => {
    const updated = await updateMenuItem(item.id, { isSpecial: !item.isSpecial });
    setMenuItems(prev => prev.map(i => i.id === updated.id ? updated : i));
  };

  const filteredItems = filterCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === filterCategory);

  // Specials first
  const sortedItems = [
    ...filteredItems.filter(i => i.isSpecial),
    ...filteredItems.filter(i => !i.isSpecial),
  ];

  return (
    <div className="max-w-[1400px] mx-auto pb-10">
      <div className="flex items-center gap-3 mb-8 border-b border-gray-200 pb-5">
        <div className="p-2.5 bg-green-100 rounded-xl">
          <Utensils className="w-6 h-6 text-green-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Menu Management</h1>
          <p className="text-sm text-gray-500 font-medium mt-0.5">Add, edit, and control items visible to customers</p>
        </div>
      </div>

      <MenuForm
        onSubmit={handleAddOrUpdate}
        editingItem={editingItem}
        onCancelEdit={() => setEditingItem(null)}
      />

      {/* Category filter */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-1.5 text-xs font-bold rounded-full border transition-all ${
              filterCategory === cat
                ? 'bg-green-600 text-white border-green-600 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
            }`}
          >
            {cat}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400 font-semibold">{filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}</span>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <p className="text-gray-400 font-bold animate-pulse">Loading menu items...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-200 font-bold mb-6">
          Failed to load menu: {error}
        </div>
      )}

      {!loading && !error && sortedItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="p-4 bg-gray-100 rounded-2xl mb-4">
            <Utensils className="w-10 h-10 text-gray-400" />
          </div>
          <p className="font-bold text-gray-700">No menu items yet</p>
          <p className="text-sm text-gray-400 mt-1">Use the form above to add your first item!</p>
        </div>
      )}

      {!loading && !error && sortedItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {sortedItems.map(item => (
            <MenuItemCard
              key={item.id}
              item={item}
              onEdit={setEditingItem}
              onDelete={handleDelete}
              onToggleAvailable={handleToggleAvailable}
              onToggleSpecial={handleToggleSpecial}
            />
          ))}
        </div>
      )}
    </div>
  );
}
