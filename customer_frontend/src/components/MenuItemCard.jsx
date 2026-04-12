import React, { useState } from 'react';
import { PlusCircle, Check, Star, Minus, Plus, Heart } from 'lucide-react';

const PLACEHOLDER_IMG = '/images/default-food.jpg';

const getInitialFavorites = () => {
  try { return JSON.parse(localStorage.getItem('favorites') || '[]'); } catch { return []; }
};

const MenuItemCard = ({ item, cart, handleAddToCart, updateQuantity }) => {
  const [isAdded, setIsAdded] = useState(false);
  const [favorites, setFavorites] = useState(getInitialFavorites);

  if (!item) return null;

  const isAvailable = item.isAvailable !== false;
  const cartItem = cart?.find(c => c.id === item.id);
  const qtyInCart = cartItem?.quantity || 0;
  const isFav = favorites.includes(item.id);

  const onClickAdd = () => {
    if (!isAvailable) return;
    handleAddToCart(item);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const toggleFavorite = (e) => {
    e.stopPropagation();
    const updated = isFav ? favorites.filter(id => id !== item.id) : [...favorites, item.id];
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  const cardStyle = {
    backgroundColor: 'var(--card-bg)',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    padding: '16px',
    transition: 'transform 0.2s ease-in-out',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    ...(item.isSpecial ? { border: '2px solid #fbbf24' } : {})
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      {/* Image */}
      <div style={{ position: 'relative' }}>
        <img
          src={item.imageUrl && item.imageUrl !== '' ? item.imageUrl : PLACEHOLDER_IMG}
          alt={item.name}
          style={{ filter: isAvailable ? 'none' : 'grayscale(100%)', width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }}
          onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
        />
        {!isAvailable && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '12px' }}>
            Out of Stock
          </div>
        )}

        {/* Favourite button */}
        <button
          onClick={toggleFavorite}
          title={isFav ? 'Remove from Favourites' : 'Add to Favourites'}
          style={{
            position: 'absolute', top: '8px', left: '8px',
            background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
            width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.15)', transition: 'transform 0.15s'
          }}
        >
          <Heart size={16} fill={isFav ? '#ef4444' : 'none'} color={isFav ? '#ef4444' : '#6b7280'} />
        </button>
      </div>

      {/* Special badge */}
      {item.isSpecial && (
        <div style={{ position: 'absolute', top: '24px', right: '24px', background: '#fbbf24', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Star size={10} fill="#fff" /> Special
        </div>
      )}

      {/* Category / time */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
        {item.category && <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.category}</span>}
        <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>⏱ 25 mins</span>
      </div>

      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-color)', marginTop: '8px', marginBottom: '6px' }}>{item.name}</h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', flexGrow: 1, marginBottom: '14px', lineHeight: '1.4' }}>
        {item.description || 'Delicious freshly prepared meal.'}
      </p>

      {/* Price + cart */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-color)' }}>₹{item.price?.toFixed(2)}</span>

        {qtyInCart > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-color)', borderRadius: '8px', padding: '4px', gap: '4px' }}>
            <button onClick={() => updateQuantity(item.id, -1)} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Minus size={14} />
            </button>
            <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: 'bold', color: 'var(--text-color)' }}>{qtyInCart}</span>
            <button onClick={() => updateQuantity(item.id, 1)} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Plus size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={onClickAdd}
            disabled={!isAvailable}
            className="btn-primary"
            style={{ backgroundColor: !isAvailable ? '#d1d5db' : (isAdded ? '#10b981' : (item.isSpecial ? '#f59e0b' : 'var(--primary)')), color: '#fff', cursor: isAvailable ? 'pointer' : 'not-allowed', padding: '7px 14px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {isAdded ? <><Check size={16} />Added</> : <><PlusCircle size={16} />Add</>}
          </button>
        )}
      </div>
    </div>
  );
};

export default MenuItemCard;
