import React, { useState, useEffect } from 'react';
import { Search, Package, MapPin, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const TrackOrder = () => {
  const [orderId, setOrderId] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const STAGES = ['accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered'];

  useEffect(() => {
    const savedOrderId = localStorage.getItem("orderId");
    if (savedOrderId && !orderId) {
      setOrderId(savedOrderId);
    }
  }, []);

  useEffect(() => {
    if (!orderId) return;

    const pollOrder = async () => {
      try {
        const response = await fetch(`http://localhost:5000/order/${orderId.trim()}`);
        const data = await response.json();
        if (response.ok) {
          setOrderDetails(data);
          setError(null);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    pollOrder();
    const intervalId = setInterval(pollOrder, 5000);
    return () => clearInterval(intervalId);
  }, [orderId]);

  const fetchOrder = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setIsLoading(true);
    setError(null);
    setOrderDetails(null);
    
    localStorage.setItem("orderId", orderId.trim());

    try {
      const response = await fetch(`http://localhost:5000/order/${orderId.trim()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch order details');
      }

      setOrderDetails(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatStatus = (status) => {
    if (!status) return 'Pending';
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  // Helper to determine the index of the current status
  const getCurrentStageIndex = (status) => {
    const s = (status || 'pending').toLowerCase();
    const index = STAGES.indexOf(s);
    return index !== -1 ? index : 0;
  };

  return (
    <div className="track-order-container animate-fade-in content-padding" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="track-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 className="page-title">Track Your Delivery</h2>
        <p className="page-subtitle">Enter your Order ID below to view the real-time status of your food.</p>
      </div>

      <div className="search-section" style={{ marginBottom: '3rem' }}>
        <form onSubmit={fetchOrder} style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <input
            type="text"
            className="form-control"
            style={{ maxWidth: '400px' }}
            placeholder="e.g., Lkjs8df9s..."
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" className="btn" disabled={isLoading || !orderId.trim()}>
            {isLoading ? <Clock className="spinner" size={20} /> : <Search size={20} />}
            <span style={{ marginLeft: '0.5rem' }}>Track</span>
          </button>
        </form>
      </div>

      {error && (
        <div className="alert-error animate-fade-in">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {orderDetails && (
        <div className="order-details-card animate-fade-in" style={{ 
          background: 'var(--card-bg)', border: '1px solid var(--border-color)', 
          borderRadius: 'var(--radius)', padding: '2rem', boxShadow: 'var(--shadow)' 
        }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h3 style={{ margin: 0 }}>Order: <span style={{ color: 'var(--primary)' }}>{orderDetails.id}</span></h3>
            <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-muted)' }}>Placed on: {formatDate(orderDetails.createdAt)}</p>
          </div>

          {/* Graphical Timeline */}
          <div className="tracking-timeline" style={{ 
            display: 'flex', justifyContent: 'space-between', position: 'relative', 
            marginBottom: '3rem', padding: '0 1rem' 
          }}>
             {/* Background Line */}
             <div style={{ 
               position: 'absolute', top: '24px', left: '10%', right: '10%', 
               height: '4px', background: 'var(--border-color)', zIndex: 1, borderRadius: '2px'
             }}></div>
             
             {/* Progress Line */}
             <div style={{ 
               position: 'absolute', top: '24px', left: '10%', 
               width: `${(getCurrentStageIndex(orderDetails.status) / (STAGES.length - 1)) * 80}%`, 
               height: '4px', background: 'var(--primary)', zIndex: 2, borderRadius: '2px',
               transition: 'width 0.5s ease'
             }}></div>

             {STAGES.map((stage, idx) => {
               const isActive = getCurrentStageIndex(orderDetails.status) >= idx;
               const isCurrent = getCurrentStageIndex(orderDetails.status) === idx;
               
               let Icon = Clock;
               if (stage === 'preparing') Icon = Package;
               if (stage === 'ready') Icon = CheckCircle;
               if (stage === 'out_for_delivery') Icon = MapPin;
               if (stage === 'delivered') Icon = CheckCircle;

               return (
                 <div key={stage} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, width: '20%' }}>
                   <div style={{ 
                     width: '50px', height: '50px', borderRadius: '50%', 
                     background: isActive ? 'var(--primary)' : 'var(--bg-color)', 
                     border: `3px solid ${isActive ? 'var(--primary)' : 'var(--border-color)'}`,
                     display: 'flex', alignItems: 'center', justifyContent: 'center',
                     color: isActive ? 'white' : 'var(--text-muted)',
                     boxShadow: isCurrent ? '0 0 0 5px var(--primary-light)' : 'none',
                     transition: 'all 0.3s ease'
                   }}>
                     <Icon size={24} />
                   </div>
                   <p style={{ 
                     marginTop: '0.8rem', fontSize: '0.85rem', fontWeight: isActive ? '600' : '400',
                     color: isActive ? 'var(--text-color)' : 'var(--text-muted)', textAlign: 'center'
                   }}>
                     {formatStatus(stage)}
                   </p>
                 </div>
               );
             })}
          </div>

          <div className="order-items-list" style={{ background: 'var(--bg-color)', padding: '1.5rem', borderRadius: 'var(--radius-sm)' }}>
            <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Receipt Details</h4>
            {orderDetails.items && orderDetails.items.map((item, index) => (
              <div key={index} style={{
                display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0'
              }}>
                <div><span style={{ fontWeight: '600', marginRight: '0.5rem' }}>{item.quantity}x</span> {item.name}</div>
                <div style={{ color: 'var(--text-muted)' }}>${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
            
            <div style={{ 
              display: 'flex', justifyContent: 'space-between', 
              paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)',
              fontWeight: '800', fontSize: '1.2rem'
            }}>
              <span>Total Paid:</span>
              <span style={{ color: 'var(--primary)' }}>${(orderDetails.totalPrice || 0).toFixed(2)}</span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default TrackOrder;
