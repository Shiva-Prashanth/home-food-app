import React from 'react';
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';

const CartDrawer = ({ isOpen, setIsOpen, cart, updateQuantity, setView }) => {
  const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    setIsOpen(false);
    setView('checkout');
  };

  return (
    <>
      {/* Overlay backdrop */}
      <div 
        onClick={() => setIsOpen(false)}
        style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1040,
          opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none', transition: 'opacity 0.3s ease'
        }} 
      />

      {/* Drawer */}
      <div 
        style={{
          position: 'fixed', top: 0, right: 0, height: '100%', width: '100%', maxWidth: '400px', backgroundColor: '#fff',
          boxShadow: '-4px 0 15px rgba(0,0,0,0.1)', zIndex: 1050, display: 'flex', flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.3s ease-in-out'
        }}
      >
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1.5rem' }}>
            <ShoppingBag size={24} color="var(--primary)" /> Your Cart
          </h2>
          <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={28} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '3rem' }}>
              <div style={{ width: '80px', height: '80px', background: 'var(--bg-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <ShoppingBag size={40} opacity={0.5} />
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>Your cart is empty</h3>
              <p>Looks like you haven't added any food yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {cart.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1, marginRight: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>{item.name}</h4>
                    <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>₹{(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-color)', borderRadius: '8px', padding: '4px' }}>
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '6px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: '600' }}>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '6px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border-color)', padding: '1.5rem', background: '#fafafa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
              <span>Subtotal</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontWeight: 'bold', fontSize: '1.25rem' }}>
              <span>Total Pay</span>
              <span style={{ color: 'var(--primary)' }}>₹{totalPrice.toFixed(2)}</span>
            </div>
            <button className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }} onClick={handleCheckout}>
              Proceed to Checkout <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
