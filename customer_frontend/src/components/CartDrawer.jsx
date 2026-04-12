import React from 'react';
import { X, Minus, Plus, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';

const CartDrawer = ({ isOpen, setIsOpen, cart, updateQuantity, setView }) => {
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  const handleCheckout = () => {
    setIsOpen(false);
    setView('checkout');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 1040,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100%',
          width: '100%',
          maxWidth: 420,
          background: 'var(--card-bg)',
          boxShadow: '-8px 0 50px rgba(0,0,0,0.15)',
          zIndex: 1050,
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-alt)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              background: 'var(--gradient-brand)',
              borderRadius: 10,
              padding: '6px',
              display: 'flex',
              boxShadow: '0 2px 8px var(--primary-glow)',
            }}>
              <ShoppingBag size={18} color="white" />
            </div>
            <div>
              <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--secondary)' }}>
                Your Cart
              </h2>
              {cart.length > 0 && (
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                  {totalItems} item{totalItems !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          </div>
          <button
            id="cart-close-btn"
            onClick={() => setIsOpen(false)}
            style={{
              background: 'var(--bg-color)',
              border: '1px solid var(--border-color)',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              transition: 'var(--transition-fast)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--primary-light)';
              e.currentTarget.style.color = 'var(--primary)';
              e.currentTarget.style.borderColor = 'rgba(249,115,22,0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--bg-color)';
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '4rem' }}>
              <div style={{
                width: 90,
                height: 90,
                background: 'var(--bg-color)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                border: '2px dashed var(--border-color)',
              }}>
                <ShoppingBag size={38} style={{ opacity: 0.25 }} />
              </div>
              <h3 style={{ fontFamily: 'Poppins, sans-serif', marginBottom: '0.5rem', color: 'var(--secondary)' }}>
                Cart is empty
              </h3>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6, maxWidth: 220, margin: '0 auto' }}>
                Browse our menu and add something delicious!
              </p>
              <button
                className="btn"
                style={{ marginTop: '1.5rem' }}
                onClick={() => { setIsOpen(false); setView('menu'); }}
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {cart.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.85rem 1rem',
                    background: 'var(--bg-alt)',
                    borderRadius: 14,
                    border: '1px solid var(--border-color)',
                    gap: '0.75rem',
                    transition: 'border-color 0.2s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(249,115,22,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '0.93rem',
                      fontWeight: 600,
                      color: 'var(--secondary)',
                      margin: '0 0 3px',
                    }}>
                      {item.name}
                    </h4>
                    <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.92rem' }}>
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--primary-light)',
                    borderRadius: 99,
                    padding: '3px 5px',
                    gap: 3,
                    border: '1.5px solid rgba(249,115,22,0.2)',
                  }}>
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      style={{
                        background: 'white',
                        border: '1px solid var(--border-color)',
                        borderRadius: '50%',
                        width: 26,
                        height: 26,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: item.quantity === 1 ? '#ef4444' : 'var(--primary)',
                        transition: 'transform 0.15s ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      {item.quantity === 1 ? <Trash2 size={11} /> : <Minus size={11} />}
                    </button>
                    <span style={{
                      minWidth: 24,
                      textAlign: 'center',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 700,
                      color: 'var(--primary)',
                      fontSize: '0.9rem',
                    }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      style={{
                        background: 'var(--primary)',
                        border: 'none',
                        borderRadius: '50%',
                        width: 26,
                        height: 26,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'white',
                        boxShadow: '0 2px 6px var(--primary-glow)',
                        transition: 'transform 0.15s ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{
            borderTop: '1px solid var(--border-color)',
            padding: '1.25rem 1.5rem',
            background: 'var(--bg-alt)',
          }}>
            {/* Subtotal row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <span>Subtotal ({totalItems} items)</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 800,
              fontSize: '1.2rem',
              color: 'var(--secondary)',
            }}>
              <span>Total</span>
              <span style={{ color: 'var(--primary)' }}>₹{totalPrice.toFixed(2)}</span>
            </div>
            <button
              id="cart-checkout-btn"
              className="btn btn-block"
              style={{ padding: '0.9rem', fontSize: '1rem' }}
              onClick={handleCheckout}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
