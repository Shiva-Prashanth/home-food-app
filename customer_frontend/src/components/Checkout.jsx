import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Loader, Copy } from 'lucide-react';

const Checkout = ({ cart, setView, clearCart }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState('');
  const [submitError, setSubmitError] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  const validateField = (name, value) => {
    // ... skipping validation definition copy, but I need to make sure I don't delete it

    let errorMsg = '';
    
    if (name === 'name') {
      if (!value.trim()) errorMsg = 'Name is required.';
      else if (value.trim().length < 3) errorMsg = 'Name must be at least 3 characters.';
    }
    
    if (name === 'phone') {
      const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
      if (!value.trim()) errorMsg = 'Phone number is required.';
      else if (!phoneRegex.test(value.trim())) errorMsg = 'Please enter a valid phone number.';
    }
    
    if (name === 'address') {
      if (!value.trim()) errorMsg = 'Delivery address is required.';
      else if (value.trim().length < 10) errorMsg = 'Please provide a complete address.';
    }

    return errorMsg;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear specific field error as user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const errorMsg = validateField(name, value);
    if (errorMsg) {
      setErrors(prev => ({ ...prev, [name]: errorMsg }));
    }
  };

  const isFormValid = () => {
    const nameError = validateField('name', formData.name);
    const phoneError = validateField('phone', formData.phone);
    const addressError = validateField('address', formData.address);
    
    if (nameError || phoneError || addressError) {
      setErrors({
        name: nameError,
        phone: phoneError,
        address: addressError
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Connect to the backend
      const response = await fetch('http://localhost:5000/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customer: formData,
          items: cart,
          totalPrice: totalPrice
        })
      });

      if (!response.ok) {
        throw new Error('Failed to place order. Please try again.');
      }
      
      const responseData = await response.json();
      const newOrderId = responseData.orderId;
      setSuccessOrderId(newOrderId);

      // Save order for auto tracking
      localStorage.setItem("orderId", newOrderId);

      // Save order to LocalStorage for the Profile View
      const pastOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
      const newOrderLog = {
        id: newOrderId,
        date: new Date().toISOString(),
        total: totalPrice,
        status: 'Pending',
        items: cart.map(item => ({ name: item.name, qty: item.quantity }))
      };
      localStorage.setItem('userOrders', JSON.stringify([newOrderLog, ...pastOrders]));

      setIsSuccess(true);
      clearCart();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(successOrderId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (isSuccess) {
    return (
      <div className="order-success animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <CheckCircle className="order-success-icon" />
        </div>
        <h2>Order Placed Successfully!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Thank you for your order. We are preparing it right now!
        </p>
        
        <p style={{ fontWeight: '500', color: 'var(--secondary)' }}>
          Please keep your Order ID saved to track its status:
        </p>

        <div style={{
          background: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-sm)', 
          border: '1px solid var(--border-color)', display: 'inline-flex', alignItems: 'center', 
          gap: '1rem', marginTop: '0.5rem', marginBottom: '2.5rem'
        }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Order ID:</p>
            <strong style={{ fontSize: '1.25rem', userSelect: 'all', color: 'var(--primary)', letterSpacing: '1px' }}>
              {successOrderId}
            </strong>
          </div>
          <button 
            className="btn-icon" 
            title="Copy Order ID"
            onClick={handleCopyId}
            style={{ width: '40px', height: '40px', background: isCopied ? 'var(--primary-light)' : 'transparent', borderColor: isCopied ? 'var(--primary)' : 'var(--border-color)'}}
          >
            {isCopied ? <CheckCircle size={20} color="var(--primary)" /> : <Copy size={20} />}
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => setView('home')}>
            Back to Menu
          </button>
          <button className="btn" onClick={() => setView('track')}>
            Track Order Now
          </button>
        </div>
      </div>
    );
  }

  // Disable button if there are explicit errors, or if main fields are completely empty
  const isSubmitDisabled = isSubmitting || 
                           !!errors.name || !!errors.phone || !!errors.address ||
                           !formData.name || !formData.phone || !formData.address;

  return (
    <div className="checkout-form animate-fade-in">
      <div className="checkout-header">
        <h2>Checkout Details</h2>
        <p>Please enter your details to complete your order.</p>
      </div>

      <div className="checkout-summary">
        <div className="summary-row">
          <span>Total Items:</span>
          <strong>{totalItems}</strong>
        </div>
        <div className="summary-row">
          <span>Amount to Pay:</span>
          <span className="summary-total">${totalPrice.toFixed(2)}</span>
        </div>
      </div>

      {submitError && (
        <div className="alert-error">
          <AlertCircle size={20} />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-control"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="John Doe"
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>
        
        <div className={`form-group ${errors.phone ? 'has-error' : ''}`}>
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="form-control"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="+1 (234) 567-8900"
          />
          {errors.phone && <span className="error-text">{errors.phone}</span>}
        </div>

        <div className={`form-group ${errors.address ? 'has-error' : ''}`}>
          <label htmlFor="address">Delivery Address</label>
          <textarea
            id="address"
            name="address"
            className="form-control"
            value={formData.address}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="123 Main St, Apt 4B. Include any specific delivery instructions."
          ></textarea>
          {errors.address && <span className="error-text">{errors.address}</span>}
        </div>

        <div className="checkout-actions">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => setView('cart')}
            disabled={isSubmitting}
          >
            Back to Cart
          </button>
          <button 
            type="submit" 
            className="btn btn-primary btn-large" 
            disabled={isSubmitDisabled}
          >
            {isSubmitting ? (
              <>
                <Loader className="spinner" size={20} style={{ marginRight: '0.5rem' }} /> Processing...
              </>
            ) : 'Place Order Now'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
