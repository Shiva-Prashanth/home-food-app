import React, { useState, useEffect } from 'react';
import { User, Package, Clock, CheckCircle, MapPin } from 'lucide-react';

const Profile = ({ setView }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Fetch orders dynamically from localStorage
    const savedOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    setOrders(savedOrders);
  }, []);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle size={18} color="#10b981" />;
      case 'cooking':
        return <Package size={18} color="#f59e0b" />;
      default:
        return <Clock size={18} color="#6366f1" />;
    }
  };

  return (
    <div className="profile-container animate-fade-in content-padding">
      <div className="profile-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div className="profile-avatar" style={{ 
          width: '100px', height: '100px', background: 'var(--primary-light)', 
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1rem auto'
        }}>
          <User size={50} color="var(--primary)" />
        </div>
        <h2 className="page-title">John Doe</h2>
        <p className="page-subtitle">+1 (234) 567-8900 | johndoe@example.com</p>
      </div>

      <div className="orders-section">
        <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
          Your Order History
        </h3>
        
        {orders.length === 0 ? (
          <div className="empty-state">
            <Package size={48} color="var(--text-muted)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <h4 style={{ color: 'var(--text-muted)' }}>No orders placed yet.</h4>
            <button className="btn" onClick={() => setView('menu')} style={{ marginTop: '1rem' }}>
              Start Ordering
            </button>
          </div>
        ) : (
          <div className="orders-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {orders.map((order, idx) => (
              <div key={idx} className="order-card" style={{
                background: 'var(--card-bg)', border: '1px solid var(--border-color)', 
                borderRadius: 'var(--radius)', padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Order ID
                    </span>
                    <strong style={{ display: 'block', fontSize: '1.1rem', color: 'var(--primary)' }}>
                      {order.id}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', 
                    background: 'var(--bg-color)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: '500' }}>
                    {getStatusIcon(order.status)}
                    <span>{order.status}</span>
                  </div>
                </div>

                <div style={{ padding: '1rem 0', borderTop: '1px dashed var(--border-color)', borderBottom: '1px dashed var(--border-color)', marginBottom: '1rem' }}>
                  {order.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span><strong style={{ marginRight: '0.5rem' }}>{item.qty}x</strong> {item.name}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {formatDate(order.date)}
                  </span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                    Total: ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
