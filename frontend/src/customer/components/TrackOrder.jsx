import React, { useState, useEffect } from 'react';
import { Search, Package, MapPin, CheckCircle, Clock, AlertCircle, ChefHat, Phone, User, Bike } from 'lucide-react';
import { API_BASE_URL } from '../../shared/config';

// ── Mock delivery partners pool ───────────────────────────────────────────────
const MOCK_PARTNERS = [
  { name: 'Ravi Kumar',    phone: '+91 98765 43210', eta: '20–30 mins', avatar: '🧑‍🦱' },
  { name: 'Suresh Babu',  phone: '+91 97654 32109', eta: '15–25 mins', avatar: '👨‍🦲' },
  { name: 'Kiran Reddy',  phone: '+91 96543 21098', eta: '25–35 mins', avatar: '🧔'  },
  { name: 'Arjun Sharma', phone: '+91 95432 10987', eta: '20–25 mins', avatar: '👱'  },
];

// Deterministic pick so the same order always gets the same partner
const getPartner = (orderId) => {
  if (!orderId) return MOCK_PARTNERS[0];
  const idx = orderId.charCodeAt(orderId.length - 1) % MOCK_PARTNERS.length;
  return MOCK_PARTNERS[idx];
};

// ── Status banner config ──────────────────────────────────────────────────────
const STATUS_BANNERS = {
  pending:          { text: '⏳ Your order has been placed and is waiting to be accepted.', bg: '#fff7ed', border: '#fed7aa', color: '#9a3412' },
  preparing:        { text: '🍳 Your meal is being freshly prepared in the kitchen!',       bg: '#eff6ff', border: '#bfdbfe', color: '#1e40af' },
  ready:            { text: '📦 Order packed and ready! Assigning a delivery partner…',     bg: '#f0fdf4', border: '#bbf7d0', color: '#166534' },
  out_for_delivery: { text: "🚚 Your order is on the way! Sit tight, it'll arrive soon.",   bg: '#faf5ff', border: '#e9d5ff', color: '#6b21a8' },
  delivered:        { text: '🎉 Order delivered! Enjoy your meal. Thank you for ordering!', bg: '#f0fdf4', border: '#86efac', color: '#14532d' },
};

const STAGES = ['pending', 'preparing', 'ready', 'out_for_delivery', 'delivered'];

const TrackOrder = () => {
  const [orderId,      setOrderId]      = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading,    setIsLoading]    = useState(false);
  const [error,        setError]        = useState(null);

  // Auto-load saved orderId
  useEffect(() => {
    const saved = localStorage.getItem('orderId');
    if (saved) setOrderId(saved);
  }, []);

  // Live polling every 5 s
  useEffect(() => {
    if (!orderId) return;
    const poll = async () => {
      try {
        const res  = await fetch(`${API_BASE_URL}/orders/${orderId.trim()}`);
        const data = await res.json();
        if (res.ok) { setOrderDetails(data); setError(null); }
      } catch { /* silent */ }
    };
    poll();
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, [orderId]);

  const fetchOrder = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setIsLoading(true); setError(null); setOrderDetails(null);
    localStorage.setItem('orderId', orderId.trim());
    try {
      const res  = await fetch(`${API_BASE_URL}/orders/${orderId.trim()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Order not found');
      setOrderDetails(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fmt    = (s)   => !s ? 'Pending' : s.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
  const fmtDt  = (iso) => iso ? new Date(iso).toLocaleString() : '';
  const stageIdx = (status) => {
    const i = STAGES.indexOf((status || 'pending').toLowerCase());
    return i !== -1 ? i : 0;
  };

  return (
    <div className="track-order-container animate-fade-in content-padding" style={{ maxWidth: '800px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 className="page-title">Track Your Delivery</h2>
        <p className="page-subtitle">Enter your Order ID below to follow your food in real time.</p>
      </div>

      {/* Prepaid notice */}
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#1e3a8a', fontSize: '0.875rem', fontWeight: 600 }}>
        <AlertCircle size={16} style={{ minWidth: 16 }} />
        All orders are prepaid — No Cash on Delivery available.
      </div>

      {/* Search bar */}
      <div style={{ marginBottom: '2.5rem' }}>
        <form onSubmit={fetchOrder} style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <input
            type="text" className="form-control"
            style={{ maxWidth: '300px', flex: 1 }}
            placeholder="Enter Order ID"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" className="btn-primary" disabled={isLoading || !orderId.trim()}>
            {isLoading ? <Clock className="spinner" size={18} /> : <Search size={18} />}
            <span>Track Now</span>
          </button>
        </form>
      </div>

      {error && (
        <div className="alert-error animate-fade-in">
          <AlertCircle size={20} /><span>{error}</span>
        </div>
      )}

      {orderDetails && (() => {
        const currentIdx       = stageIdx(orderDetails.status);
        const partner          = getPartner(orderDetails.id);
        const isOutForDelivery = orderDetails.status === 'out_for_delivery';
        const isDelivered      = orderDetails.status === 'delivered';
        const banner           = STATUS_BANNERS[orderDetails.status] || STATUS_BANNERS.pending;

        return (
          <div className="animate-fade-in" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', padding: '2rem', boxShadow: 'var(--shadow)' }}>

            {/* Order header */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Order: <span style={{ color: 'var(--primary)' }}>{orderDetails.id}</span></h3>
              <p style={{ margin: '0.4rem 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Placed: {fmtDt(orderDetails.createdAt)}
              </p>
            </div>

            {/* Contextual status banner */}
            <div style={{ background: banner.bg, border: `1px solid ${banner.border}`, borderRadius: '8px', padding: '0.875rem 1rem', marginBottom: '2rem', color: banner.color, fontWeight: 700, fontSize: '0.95rem', textAlign: 'center' }}>
              {banner.text}
            </div>

            {/* Progress timeline */}
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '2.5rem', padding: '0 1rem' }}>
              <div style={{ position: 'absolute', top: '24px', left: '10%', right: '10%', height: '4px', background: 'var(--border-color)', zIndex: 1, borderRadius: '2px' }} />
              <div style={{ position: 'absolute', top: '24px', left: '10%', width: `${(currentIdx / (STAGES.length - 1)) * 80}%`, height: '4px', background: 'var(--primary)', zIndex: 2, borderRadius: '2px', transition: 'width 0.5s ease' }} />

              {STAGES.map((stage, idx) => {
                const isActive  = currentIdx >= idx;
                const isCurrent = currentIdx === idx;
                let Icon = Clock;
                if (stage === 'preparing')       Icon = ChefHat;
                if (stage === 'ready')            Icon = Package;
                if (stage === 'out_for_delivery') Icon = MapPin;
                if (stage === 'delivered')        Icon = CheckCircle;

                return (
                  <div key={stage} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, width: '20%' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: isActive ? 'var(--primary)' : 'var(--bg-color)', border: `3px solid ${isActive ? 'var(--primary)' : 'var(--border-color)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isActive ? 'white' : 'var(--text-muted)', boxShadow: isCurrent ? '0 0 0 5px var(--primary-light)' : 'none', transition: 'all 0.3s ease' }}>
                      <Icon size={22} />
                    </div>
                    <p style={{ marginTop: '0.75rem', fontSize: '0.78rem', fontWeight: isActive ? '700' : '400', color: isActive ? 'var(--text-color)' : 'var(--text-muted)', textAlign: 'center', lineHeight: 1.3 }}>
                      {fmt(stage)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Delivery partner card — shown when out_for_delivery or delivered */}
            {(isOutForDelivery || isDelivered) && (
              <div style={{ background: 'linear-gradient(135deg,#f5f3ff,#ede9fe)', border: '1px solid #c4b5fd', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#6d28d9', fontWeight: 800, fontSize: '1rem' }}>
                  <Bike size={20} /> Delivery Partner
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {/* Avatar */}
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', flexShrink: 0 }}>
                    {partner.avatar}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '1.05rem', color: '#1f2937' }}>
                      <User size={15} /> {partner.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#6b7280', fontSize: '0.875rem', marginTop: '0.2rem' }}>
                      <Phone size={14} /> {partner.phone}
                    </div>
                  </div>
                  {/* ETA / Delivered badge */}
                  {isDelivered ? (
                    <div style={{ background: '#16a34a', color: 'white', borderRadius: '8px', padding: '0.5rem 0.875rem', fontSize: '0.8rem', fontWeight: 700, textAlign: 'center', flexShrink: 0 }}>
                      ✅<br />Delivered
                    </div>
                  ) : (
                    <div style={{ background: '#7c3aed', color: 'white', borderRadius: '8px', padding: '0.5rem 0.875rem', fontSize: '0.8rem', fontWeight: 700, textAlign: 'center', flexShrink: 0 }}>
                      ETA<br />{partner.eta}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Receipt */}
            <div style={{ background: 'var(--bg-color)', padding: '1.5rem', borderRadius: 'var(--radius-sm)' }}>
              <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Receipt</h4>
              {orderDetails.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', fontSize: '0.95rem' }}>
                  <div><span style={{ fontWeight: 600, marginRight: '0.4rem' }}>{item.quantity}x</span>{item.name}</div>
                  <div style={{ color: 'var(--text-muted)' }}>₹{(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', marginTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontWeight: 800, fontSize: '1.1rem' }}>
                <span>Total Paid</span>
                <span style={{ color: 'var(--primary)' }}>₹{(orderDetails.totalPrice || 0).toFixed(2)}</span>
              </div>
            </div>

          </div>
        );
      })()}
    </div>
  );
};

export default TrackOrder;
