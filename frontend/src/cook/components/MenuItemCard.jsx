import { Pencil, Trash2 } from 'lucide-react';

const CATEGORY_COLORS = {
  'Veg':        'bg-green-100 text-green-700',
  'Non-Veg':    'bg-red-100 text-red-700',
  'Diet':       'bg-blue-100 text-blue-700',
  'Beverages':  'bg-cyan-100 text-cyan-700',
  'Desserts':   'bg-pink-100 text-pink-700',
  'Snacks':     'bg-orange-100 text-orange-700',
  'Other':      'bg-gray-100 text-gray-600',
};

export default function MenuItemCard({ item, onEdit, onDelete, onToggleAvailable, onToggleSpecial }) {
  const categoryColor = CATEGORY_COLORS[item.category] || CATEGORY_COLORS['Other'];

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-3 transition-all hover:shadow-md ${item.isSpecial ? 'border-yellow-300 ring-1 ring-yellow-200' : 'border-gray-100'}`}>
      
      {item.imageUrl && (
        <div className="w-full h-32 rounded-xl overflow-hidden mb-2">
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
        </div>
      )}

      {/* Top Row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {item.isSpecial && (
              <span className="text-xs font-bold text-yellow-600 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-full">⭐ Special</span>
            )}
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${categoryColor}`}>
              {item.category}
            </span>
          </div>
          <h3 className="font-bold text-gray-900 text-base leading-tight">{item.name}</h3>
          {item.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-black text-gray-900">₹{item.price.toFixed(2)}</p>
        </div>
      </div>

      {/* Toggle Row */}
      <div className="flex items-center gap-4 pt-1 border-t border-gray-50">
        {/* Available toggle */}
        <button
          onClick={() => onToggleAvailable(item)}
          className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
            item.isAvailable
              ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
              : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${item.isAvailable ? 'bg-green-500' : 'bg-gray-400'}`} />
          {item.isAvailable ? 'Available' : 'Unavailable'}
        </button>

        {/* Special toggle */}
        <button
          onClick={() => onToggleSpecial(item)}
          className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
            item.isSpecial
              ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
              : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
          }`}
        >
          ⭐ {item.isSpecial ? 'Is Special' : 'Set Special'}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onEdit(item)}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-3 py-2 rounded-xl transition-all"
        >
          <Pencil className="w-3.5 h-3.5" /> Edit
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 px-3 py-2 rounded-xl transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>
    </div>
  );
}
