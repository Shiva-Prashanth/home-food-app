import { useState, useEffect } from 'react';
import { getIngredients } from '../services/api';

const CATEGORIES = ['Veg', 'Non-Veg', 'Diet', 'Beverages', 'Desserts', 'Snacks', 'Other'];

const emptyForm = {
  name: '',
  description: '',
  price: '',
  category: 'Veg',
  isAvailable: true,
  isSpecial: false,
  imageUrl: '',
  ingredientsUsed: []
};

export default function MenuForm({ onSubmit, editingItem, onCancelEdit }) {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [allIngredients, setAllIngredients] = useState([]);

  useEffect(() => {
    getIngredients().then(setAllIngredients).catch(console.error);
  }, []);

  // Populate form when editing
  useEffect(() => {
    if (editingItem) {
      setForm({
        name: editingItem.name || '',
        description: editingItem.description || '',
        price: editingItem.price?.toString() || '',
        category: editingItem.category || 'Veg',
        isAvailable: editingItem.isAvailable ?? true,
        isSpecial: editingItem.isSpecial ?? false,
        imageUrl: editingItem.imageUrl || '',
        ingredientsUsed: editingItem.ingredientsUsed || []
      });
    } else {
      setForm(emptyForm);
    }
  }, [editingItem]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAddIngredient = () => {
    setForm(prev => ({
      ...prev,
      ingredientsUsed: [...prev.ingredientsUsed, { ingredientId: '', quantity: '' }]
    }));
  };

  const handleRemoveIngredient = (index) => {
    setForm(prev => ({
      ...prev,
      ingredientsUsed: prev.ingredientsUsed.filter((_, i) => i !== index)
    }));
  };

  const handleIngredientChange = (index, field, value) => {
    setForm(prev => {
      const newIngs = [...prev.ingredientsUsed];
      newIngs[index] = { ...newIngs[index], [field]: value };
      return { ...prev, ingredientsUsed: newIngs };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const price = parseFloat(form.price);
    if (!form.name.trim()) return setError('Item name is required.');
    if (isNaN(price) || price <= 0) return setError('Please enter a valid price.');
    if (!form.imageUrl.trim()) return setError('Image URL is required.');

    // Sanitize and validate custom ingredients
    const validIngredients = form.ingredientsUsed.filter(ing => ing.ingredientId && ing.quantity);
    
    for (const ing of validIngredients) {
      if (parseFloat(ing.quantity) <= 0) {
        return setError('Ingredient quantities must be greater than 0.');
      }
      ing.quantity = parseFloat(ing.quantity);
    }

    setSubmitting(true);
    try {
      await onSubmit({ ...form, price, ingredientsUsed: validIngredients });
      setForm(emptyForm);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const isEditing = !!editingItem;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">
          {isEditing ? '✏️ Edit Menu Item' : '➕ Add New Item'}
        </h2>
        {isEditing && (
          <button
            onClick={onCancelEdit}
            className="text-sm text-gray-500 hover:text-gray-800 font-semibold transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Item Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Paneer Butter Masala"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Price (₹) *</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="e.g. 180"
              min="0"
              step="0.01"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Category *</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-400 transition bg-white"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Short description (optional)"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Image URL *</label>
          <input
            type="text"
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-400 transition"
          />
          {form.imageUrl && (
            <img src={form.imageUrl} className="w-32 h-32 mt-2 rounded object-cover" alt="Preview" />
          )}
        </div>

        {/* Ingredients Section */}
        <div className="mb-5 border-t border-gray-100 pt-4">
          <div className="mb-3">
             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Ingredients Used (Optional)</label>
             <p className="text-xs text-gray-400 mt-1">Leave empty to safely use standard default proportions automatically.</p>
          </div>

           <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
              {form.ingredientsUsed.map((ing, i) => (
                <div key={i} className="flex items-center gap-3">
                  <select
                    value={ing.ingredientId}
                    onChange={(e) => handleIngredientChange(i, 'ingredientId', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-400 focus:outline-none bg-white"
                  >
                    <option value="">Select Ingredient...</option>
                    {allIngredients.map(a => (
                      <option value={a.id} key={a.id}>{a.name} ({a.unit})</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Qty"
                    value={ing.quantity}
                    onChange={(e) => handleIngredientChange(i, 'quantity', e.target.value)}
                    className="w-24 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
                  />
                  <button type="button" onClick={() => handleRemoveIngredient(i)} className="text-red-500 font-bold px-2 hover:bg-red-50 rounded">✕</button>
                </div>
              ))}
              
              <button type="button" onClick={handleAddIngredient} className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
                + Add Ingredient
              </button>
           </div>
        </div>

        <div className="flex items-center gap-6 mb-6 pt-2 border-t border-gray-100">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              name="isAvailable"
              checked={form.isAvailable}
              onChange={handleChange}
              className="w-4 h-4 accent-green-500 rounded"
            />
            <span className="text-sm font-semibold text-gray-700">Available</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              name="isSpecial"
              checked={form.isSpecial}
              onChange={handleChange}
              className="w-4 h-4 accent-yellow-500 rounded"
            />
            <span className="text-sm font-semibold text-gray-700">⭐ Today's Special</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
        >
          {submitting ? 'Saving...' : isEditing ? 'Update Item' : 'Add Item'}
        </button>
      </form>
    </div>
  );
}
