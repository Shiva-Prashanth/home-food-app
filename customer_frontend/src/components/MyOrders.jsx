import React, { useState, useEffect } from 'react';
import { Package, ChefHat, MessageSquare, Star } from 'lucide-react';

const STATUS_COLORS = {
  pending:          { bg: 'bg-gray-100', text: 'text-gray-500' },
  accepted:         { bg: 'bg-blue-100', text: 'text-blue-600' },
  preparing:        { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  out_for_delivery: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  delivered:        { bg: 'bg-green-100', text: 'text-green-600' },
};

const StarRating = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: '4px', margin: '0.5rem 0' }}>
    {[1, 2, 3, 4, 5].map(n => (
      <button key={n} type="button" onClick={() => onChange(n)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        <Star size={20} fill={n <= value ? '#f59e0b' : 'none'} color={n <= value ? '#f59e0b' : '#d1d5db'} />
      </button>
    ))}
  </div>
);

const MyOrders = ({ setView }) => {
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState({});
  const [reviewForms, setReviewForms] = useState({}); 

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('userOrders') || '[]');
    setOrders(stored);

    const storedReviews = JSON.parse(localStorage.getItem('reviews') || '{}');
    setReviews(storedReviews);
  }, []);

  // Safe sorting - newest first (using date or createdAt field)
  const sortedOrders = [...orders].sort((a, b) => {
    const dateA = new Date(a.date || a.createdAt);
    const dateB = new Date(b.date || b.createdAt);
    return dateB - dateA;
  });

  const openReviewForm = (orderId) => {
    setReviewForms(prev => ({ ...prev, [orderId]: { rating: 0, comment: '', open: true } }));
  };

  const handleReviewChange = (orderId, field, value) => {
    setReviewForms(prev => ({ ...prev, [orderId]: { ...prev[orderId], [field]: value } }));
  };

  const submitReview = (orderId) => {
    const form = reviewForms[orderId];
    if (!form.rating) return;
    const updated = { ...reviews, [orderId]: { orderId, rating: form.rating, comment: form.comment } };
    setReviews(updated);
    localStorage.setItem('reviews', JSON.stringify(updated));
    setReviewForms(prev => ({ ...prev, [orderId]: { ...prev[orderId], open: false } }));
  };

  const getStatusStyle = (status) => STATUS_COLORS[status?.toLowerCase()] || { bg: 'bg-gray-100', text: 'text-gray-500' };

  if (sortedOrders.length === 0) {
    return (
      <div className="animate-fade-in" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <Package size={56} color="var(--text-muted)" style={{ opacity: 0.35, marginBottom: '1rem' }} />
        <h3 style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No orders yet.</h3>
        <button className="btn-primary" onClick={() => setView('menu')}>Explore Menu</button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in layout-container" style={{ padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="text-xl font-semibold" style={{ fontSize: '1.75rem', fontWeight: 800 }}>My Orders</h1>
      </div>

      <div className="grid grid-cards" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {sortedOrders.map((order) => {
          const statusStyle = getStatusStyle(order.status);
          const existingReview = reviews[order.id];
          const form = reviewForms[order.id];
          const isDelivered = order.status?.toLowerCase() === 'delivered';
          
          const visibleItems = (order.items || []).slice(0, 3);
          const remaining = (order.items || []).length - 3;

          return (
            <div key={order.id} className="card-elevated hover-shadow transition" style={{ 
              background: 'var(--card-bg)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '14px', 
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              height: '100%'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Order ID</span>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>{order.id}</div>
                </div>
                <span className={`${statusStyle.bg} ${statusStyle.text}`} style={{ 
                  padding: '4px 12px', 
                  borderRadius: '20px', 
                  fontSize: '0.75rem', 
                  fontWeight: 700,
                  textTransform: 'capitalize'
                }}>
                  {order.status || 'Pending'}
                </span>
              </div>

              {/* Items List */}
              <div style={{ margin: '0.5rem 0', flexGrow: 1 }}>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
                  {visibleItems.map((item, i) => (
                    <span key={i}>
                      {item.name} x{item.qty}{i < visibleItems.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                  {remaining > 0 && <span style={{ color: 'var(--text-muted)' }}> ... +{remaining} more</span>}
                </p>
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>₹{typeof order.total === 'number' ? order.total.toFixed(2) : order.total}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(order.date || order.createdAt).toLocaleString()}</div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                   <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setView('track')}>Track</button>
                   {isDelivered && !existingReview && !form?.open && (
                    <button onClick={() => openReviewForm(order.id)} style={{ background: '#fffbeb', border: '1px solid #f59e0b', color: '#b45309', borderRadius: '8px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={14} /> Review
                    </button>
                  )}
                </div>
              </div>

              {/* Review Section */}
              {form?.open && (
                <div style={{ marginTop: '1rem', background: 'var(--bg-color)', borderRadius: '10px', padding: '1rem', border: '1px solid var(--border-color)' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MessageSquare size={16} /> Rate your order
                  </p>
                  <StarRating value={form.rating} onChange={v => handleReviewChange(order.id, 'rating', v)} />
                  <textarea
                    rows={2}
                    placeholder="Optional feedback..."
                    value={form.comment}
                    onChange={e => handleReviewChange(order.id, 'comment', e.target.value)}
                    className="form-control"
                    style={{ marginTop: '0.5rem', resize: 'none', fontSize: '0.85rem' }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <button className="btn-primary" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => submitReview(order.id)} disabled={!form.rating}>Submit</button>
                    <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => setReviewForms(prev => ({ ...prev, [order.id]: { ...prev[order.id], open: false } }))}>Cancel</button>
                  </div>
                </div>
              )}

              {existingReview && (
                <div style={{ marginTop: '1rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {[1,2,3,4,5].map(n => <Star key={n} size={12} fill={n <= existingReview.rating ? '#f59e0b' : 'none'} color={n <= existingReview.rating ? '#f59e0b' : '#d1d5db'} />)}
                  </div>
                  {existingReview.comment && <p style={{ fontSize: '0.8rem', color: '#78350f', marginTop: '4px' }}>{existingReview.comment}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyOrders;
