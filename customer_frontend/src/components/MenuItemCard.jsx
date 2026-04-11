import React, { useState } from 'react';
import { PlusCircle, Check, Star } from 'lucide-react';

const PLACEHOLDER_IMG = 'https://via.placeholder.com/300x200?text=Food';

const MenuItemCard = ({ item, handleAddToCart }) => {
  const [isAdded, setIsAdded] = useState(false);

  const onClickAdd = () => {
    handleAddToCart(item);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  // Inline styles to mimic the requested Tailwind classes perfectly, in case Tailwind isn't installed
  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '12px', /* rounded-xl */
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', /* shadow-md */
    padding: '16px', /* p-4 */
    transition: 'transform 0.2s ease-in-out', /* transition hover:scale-105 */
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    ...(item.isSpecial ? { border: '2px solid #fbbf24' } : {})
  };

  const imgStyle = {
    width: '100%',
    height: '160px', /* h-40 */
    objectFit: 'cover',
    borderRadius: '8px', /* rounded-lg */
    marginBottom: '12px'
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-md p-4 transition" 
      style={cardStyle}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      {/* Image (top) */}
      <img
        src={item.imageUrl || PLACEHOLDER_IMG}
        alt={item.name}
        className="w-full h-40 object-cover rounded-lg"
        style={imgStyle}
        onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
      />

      {/* Special Badge Over Image */}
      {item.isSpecial && (
        <div style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          background: '#fbbf24',
          color: '#fff',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          boxShadow: '0 2px 8px rgba(251,191,36,0.4)'
        }}>
          <Star size={12} fill="#fff" /> Special
        </div>
      )}

      {/* Category label (small text) */}
      {item.category && (
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {item.category}
        </span>
      )}

      {/* Name (bold) */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1f2937', marginTop: '4px', marginBottom: '8px' }}>
        {item.name}
      </h3>

      {/* Description (small text) */}
      <p style={{ fontSize: '0.875rem', color: '#6b7280', flexGrow: 1, marginBottom: '16px', lineHeight: '1.4' }}>
        {item.description || 'Delicious freshly prepared meal.'}
      </p>

      {/* Price and Add to Cart Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
        {/* Price (highlighted) */}
        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>
          ₹{item.price?.toFixed(2)}
        </span>

        {/* Add to Cart button */}
        <button
          onClick={onClickAdd}
          style={{
            backgroundColor: isAdded ? '#10b981' : (item.isSpecial ? '#f59e0b' : 'var(--primary)'),
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: '8px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {isAdded ? (
            <><Check size={18} /> Added</>
          ) : (
            <><PlusCircle size={18} /> Add</>
          )}
        </button>
      </div>
    </div>
  );
};

export default MenuItemCard;
