import React from 'react';
import { Trash2, ArrowRight, Minus, Plus } from 'lucide-react';

const Cart = ({ cart, updateQuantity, removeFromCart, setView }) => {
  const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  if (cart.length === 0) {
    return (
      <div className="cart-container animate-fade-in">
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any delicious food yet.</p>
          <button className="btn" style={{ marginTop: '1.5rem' }} onClick={() => setView('home')}>
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container animate-fade-in">
      <h2 style={{ marginBottom: '2rem' }}>Your Order</h2>
      
      <div className="cart-items">
        {cart.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-details">
              {item.image ? (
                <img src={item.image} alt={item.name} className="cart-item-image" />
              ) : (
                <div style={{ width: '60px', height: '60px', borderRadius: '8px', backgroundColor: '#f1f2f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem', flexShrink: 0 }}>
                   <span style={{ fontSize: '24px' }}>🍲</span>
                </div>
              )}
              <div className="cart-item-info">
                <h4>{item.name}</h4>
                <span className="cart-item-price">${item.price.toFixed(2)}</span>
              </div>
            </div>

            <div className="cart-item-controls">
              <div className="quantity-controls">
                <button 
                  className="btn-icon" 
                  onClick={() => updateQuantity(item.id, -1)}
                  disabled={item.quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className="quantity-display">{item.quantity}</span>
                <button 
                  className="btn-icon" 
                  onClick={() => updateQuantity(item.id, 1)}
                >
                  <Plus size={16} />
                </button>
              </div>

              <span className="cart-item-subtotal">
                ${(item.price * item.quantity).toFixed(2)}
              </span>

              <button 
                className="btn-icon btn-icon-danger" 
                onClick={() => removeFromCart(item.id)}
                title="Remove item"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="cart-total">
          <span>Total:</span>
          <span style={{ color: 'var(--primary)' }}>${totalPrice.toFixed(2)}</span>
        </div>
        <button className="btn btn-large" onClick={() => setView('checkout')}>
          Proceed to Checkout <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
        </button>
      </div>
    </div>
  );
};

export default Cart;
