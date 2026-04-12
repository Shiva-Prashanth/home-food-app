import React, { useState } from 'react';
import { PlusCircle, Check, Star, Minus, Plus, Heart, Clock } from 'lucide-react';

const PLACEHOLDER_IMG = '/images/default-food.jpg';

const getInitialFavorites = () => {
  try { return JSON.parse(localStorage.getItem('favorites') || '[]'); } catch { return []; }
};

const MenuItemCard = ({ item, cart, handleAddToCart, updateQuantity }) => {
  const [isAdded, setIsAdded] = useState(false);
  const [favorites, setFavorites] = useState(getInitialFavorites);
  const [imgError, setImgError] = useState(false);

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
    const updated = isFav
      ? favorites.filter(id => id !== item.id)
      : [...favorites, item.id];
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  return (
    <div
      id={`menu-item-${item.id}`}
      style={{
        background: 'var(--card-bg)',
        borderRadius: 20,
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        border: item.isSpecial
          ? '2px solid #fbbf24'
          : '1px solid var(--border-color)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        if (!item.isSpecial) e.currentTarget.style.borderColor = 'rgba(249,115,22,0.25)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-card)';
        if (!item.isSpecial) e.currentTarget.style.borderColor = 'var(--border-color)';
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', overflow: 'hidden', height: 175, background: 'var(--bg-color)' }}>
        <img
          src={!imgError && item.imageUrl && item.imageUrl !== '' ? item.imageUrl : PLACEHOLDER_IMG}
          alt={item.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: isAvailable ? 'none' : 'grayscale(85%)',
            transition: 'transform 0.5s ease',
          }}
          onError={() => setImgError(true)}
          onMouseEnter={e => (e.target.style.transform = 'scale(1.07)')}
          onMouseLeave={e => (e.target.style.transform = 'scale(1)')}
        />

        {/* Unavailable overlay */}
        {!isAvailable && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{
              background: 'rgba(255,255,255,0.95)',
              color: '#b91c1c',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 700,
              fontSize: '0.88rem',
              padding: '6px 16px',
              borderRadius: 99,
              letterSpacing: '0.04em',
            }}>
              Out of Stock
            </span>
          </div>
        )}

        {/* Favourite button */}
        <button
          id={`fav-btn-${item.id}`}
          onClick={toggleFavorite}
          title={isFav ? 'Remove from Favourites' : 'Add to Favourites'}
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(6px)',
            border: 'none',
            borderRadius: '50%',
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            transition: 'transform 0.2s ease',
            zIndex: 2,
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Heart size={15} fill={isFav ? '#ef4444' : 'none'} color={isFav ? '#ef4444' : '#6b7280'} />
        </button>

        {/* Special badge */}
        {item.isSpecial && (
          <div style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'linear-gradient(135deg, #f97316, #fbbf24)',
            color: '#fff',
            padding: '3px 10px',
            borderRadius: 99,
            fontSize: '0.68rem',
            fontWeight: 700,
            fontFamily: 'Poppins, sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            letterSpacing: '0.05em',
            boxShadow: '0 2px 8px rgba(249,115,22,0.35)',
            zIndex: 2,
          }}>
            <Star size={9} fill="#fff" /> SPECIAL
          </div>
        )}

        {/* Price badge on image */}
        <div style={{
          position: 'absolute',
          bottom: 10,
          right: 10,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(6px)',
          padding: '4px 12px',
          borderRadius: 99,
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 800,
          color: 'var(--primary)',
          fontSize: '1rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 2,
        }}>
          ₹{item.price?.toFixed(2)}
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: '1.1rem 1.25rem 1.35rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Category + Time row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          {item.category && (
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: 'var(--primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              background: 'var(--primary-light)',
              padding: '2px 8px',
              borderRadius: 99,
            }}>
              {item.category}
            </span>
          )}
          <span style={{
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            marginLeft: 'auto',
          }}>
            <Clock size={11} /> 25 mins
          </span>
        </div>

        {/* Name */}
        <h3 style={{
          fontFamily: 'Poppins, sans-serif',
          fontSize: '1.05rem',
          fontWeight: 700,
          color: 'var(--secondary)',
          marginBottom: 5,
          lineHeight: 1.3,
        }}>
          {item.name}
        </h3>

        {/* Description */}
        <p style={{
          fontSize: '0.83rem',
          color: 'var(--text-muted)',
          flexGrow: 1,
          marginBottom: 14,
          lineHeight: 1.5,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {item.description || 'Delicious freshly prepared meal.'}
        </p>

        {/* Price + Cart Controls */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 'auto' }}>
          {qtyInCart > 0 ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--primary-light)',
              borderRadius: 99,
              padding: '4px 6px',
              gap: 4,
              border: '1.5px solid rgba(249,115,22,0.2)',
            }}>
              <button
                id={`qty-dec-${item.id}`}
                onClick={() => updateQuantity(item.id, -1)}
                style={{
                  background: 'white',
                  border: '1px solid var(--border-color)',
                  borderRadius: '50%',
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--primary)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                <Minus size={13} />
              </button>
              <span style={{
                minWidth: 26,
                textAlign: 'center',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 700,
                color: 'var(--primary)',
                fontSize: '0.95rem',
              }}>
                {qtyInCart}
              </span>
              <button
                id={`qty-inc-${item.id}`}
                onClick={() => updateQuantity(item.id, 1)}
                style={{
                  background: 'var(--primary)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  boxShadow: '0 2px 8px var(--primary-glow)',
                }}
              >
                <Plus size={13} />
              </button>
            </div>
          ) : (
            <button
              id={`add-to-cart-${item.id}`}
              onClick={onClickAdd}
              disabled={!isAvailable}
              className="btn"
              style={{
                background: !isAvailable
                  ? '#d1d5db'
                  : isAdded
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : item.isSpecial
                      ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                      : 'var(--gradient-brand)',
                cursor: isAvailable ? 'pointer' : 'not-allowed',
                padding: '7px 18px',
                fontSize: '0.88rem',
                borderRadius: 99,
                boxShadow: isAvailable && !isAdded ? '0 3px 10px var(--primary-glow)' : 'none',
              }}
            >
              {isAdded ? <><Check size={15} /> Added!</> : <><PlusCircle size={15} /> Add</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
