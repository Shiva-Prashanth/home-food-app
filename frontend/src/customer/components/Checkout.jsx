import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Loader, Copy, MapPin, User } from 'lucide-react';

const supportedCities = ["Hyderabad", "Secunderabad"];

const Checkout = ({ cart, setView, clearCart }) => {
  const savedProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');

  const profileName    = savedProfile.name  || '';
  const profilePhone   = savedProfile.phone || '';
  const profileHouse   = savedProfile.house || '';
  const profileStreet  = savedProfile.street || '';
  const profileCity    = savedProfile.city  || '';
  const profileState   = savedProfile.state || '';

  const hasFullProfile = profileName && profilePhone && profileHouse && profileStreet && profileCity && profileState;
  const combinedAddress = hasFullProfile
    ? `${profileHouse}, ${profileStreet}, ${profileCity}, ${profileState}`
    : '';

  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess]       = useState(false);
  const [successOrderId, setSuccessOrderId] = useState('');
  const [submitError, setSubmitError]   = useState(null);
  const [isCopied, setIsCopied]         = useState(false);
  const [savedInstructions, setSavedInstructions] = useState('');

  const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  const isCitySupported = supportedCities.some(
    c => c.toLowerCase() === profileCity.trim().toLowerCase()
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formattedItems = cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      const payload = {
        customerName: profileName,
        phone: profilePhone,
        address: combinedAddress,
        items: formattedItems,
        totalAmount: totalPrice,
        specialInstructions: specialInstructions.trim() || ''
      };
      
      // Store payload temporarily and transition
      localStorage.setItem('pendingOrderPayload', JSON.stringify(payload));
      
      setTimeout(() => {
        setIsSubmitting(false);
        setView('payment');
      }, 400); // give a brief loading visual

    } catch (err) {
      setSubmitError("Failed to initialize checkout payload.");
      setIsSubmitting(false);
    }
  };



  // ── Main checkout screen ─────────────────────────────────────────────────────
  return (
    <div className="checkout-form animate-fade-in">
      <div className="checkout-header">
        <h2>Checkout</h2>
        <p>Review your order and confirm delivery details.</p>
      </div>

      {/* Order Summary */}
      <div className="checkout-summary">
        <div className="summary-row">
          <span>Total Items:</span>
          <strong>{totalItems}</strong>
        </div>
        <div className="summary-row">
          <span>Estimated Delivery:</span>
          <strong style={{ color: 'var(--primary)' }}>25–35 mins ⏱</strong>
        </div>
        <div className="summary-row">
          <span>Amount to Pay:</span>
          <span className="summary-total">₹{totalPrice.toFixed(2)}</span>
        </div>
      </div>

      {submitError && (
        <div className="alert-error" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
          <AlertCircle size={20} /><span>{submitError}</span>
        </div>
      )}

      {/* Delivery address card – read from Profile */}
      <div style={{
        background: '#f9fafb', border: '1px solid var(--border-color)',
        borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
            <MapPin size={18} color="var(--primary)" /> Delivery Details
          </div>
          <button
            type="button"
            onClick={() => setView('profile')}
            style={{ fontSize: '0.85rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            {hasFullProfile ? 'Edit Address' : 'Add in Profile →'}
          </button>
        </div>

        {hasFullProfile ? (
          <div style={{ fontSize: '0.95rem', color: 'var(--text-color)', lineHeight: '1.7' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
              <User size={15} color="var(--text-muted)" />
              <strong>{profileName}</strong>&nbsp;·&nbsp;{profilePhone}
            </div>
            <div style={{ color: 'var(--text-muted)', paddingLeft: '1.2rem' }}>
              {combinedAddress}
            </div>
            {!isCitySupported && (
              <div style={{
                marginTop: '0.75rem', background: '#fee2e2', border: '1px solid #ef4444',
                color: '#b91c1c', padding: '0.6rem 0.8rem', borderRadius: '6px',
                display: 'flex', gap: '0.4rem', alignItems: 'center', fontSize: '0.875rem', fontWeight: 500
              }}>
                <AlertCircle size={16} />
                Sorry, we currently do not deliver to <strong>{profileCity}</strong>.
                We serve Hyderabad &amp; Secunderabad only.
              </div>
            )}
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <p style={{ marginBottom: '0.75rem' }}>
              Please complete your profile to add a delivery address.
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setView('profile')}
              style={{ fontSize: '0.875rem' }}
            >
              Go to Profile →
            </button>
          </div>
        )}
      </div>

      {/* Special Instructions */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-color)' }}>
          🗒 Special Instructions <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span>
        </label>
        <textarea
          rows={3}
          placeholder="e.g. Less spicy, no onions, extra sauce..."
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          className="form-control"
          style={{ resize: 'none', fontSize: '0.9rem', width: '100%' }}
        />
      </div>

      {/* Place Order button */}
      <form onSubmit={handleSubmit}>
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '0.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e3a8a' }}>
          <AlertCircle size={18} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>All orders are prepaid. Cash on Delivery is not available.</span>
        </div>
        <div className="checkout-actions" style={{ justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button
            type="button" className="btn btn-secondary"
            onClick={() => setView('cart')} disabled={isSubmitting}
          >
            Back to Cart
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-large"
            disabled={isSubmitting || !hasFullProfile || !isCitySupported}
          >
            {isSubmitting
              ? <><Loader className="spinner" size={20} style={{ marginRight: '0.5rem' }} />Preparing...</>
              : 'Proceed to Payment →'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
