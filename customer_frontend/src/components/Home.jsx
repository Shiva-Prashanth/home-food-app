import React, { useState, useEffect } from 'react';
import { ArrowRight, Star, ChefHat, Utensils, Search, Package } from 'lucide-react';
import { getMenu } from '../services/api';
import KitchenStatusBanner from './KitchenStatusBanner';

const Home = ({ setView }) => {
  const [specials, setSpecials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpecials = async () => {
      try {
        const data = await getMenu();
        // Filter only available AND special items
        const specialItems = data.filter(item => item.isAvailable && item.isSpecial);
        setSpecials(specialItems);
      } catch (err) {
        console.error("Failed to load specials:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSpecials();
  }, []);

  return (
    <div className="home-container animate-fade-in layout-container" style={{ paddingTop: '0' }}>
      <KitchenStatusBanner />
      {/* Hero Section */}
      <section className="hero-section" style={{ marginTop: '2.5rem' }}>
        <div className="hero-content">
          <h1 className="hero-title">Authentic Homemade Food, Delivered Fresh.</h1>
          <p className="hero-subtitle">
            Experience the rich taste of traditional cooking right at your doorstep. We prepare every meal with love, using locally sourced ingredients and time-honored recipes.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
            <button className="btn-primary" onClick={() => setView('menu')} style={{ minWidth: '200px' }}>
              Order Now <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
            </button>
          </div>
        </div>
        <div className="hero-image-wrapper" style={{ marginTop: '2rem' }}>
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"
            alt="Delicious homemade food spread"
            className="hero-image"
          />
        </div>
      </section>

      {/* WhatsApp subtle info strip */}
      <div style={{
        background: '#f0fdf4', border: '1px solid #bbf7d0',
        borderRadius: '10px', padding: '0.75rem 1.25rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '0.75rem', flexWrap: 'wrap', margin: '0 0 1rem 0',
        fontSize: '0.9rem', color: '#166534'
      }}>
        <span>📱 Prefer WhatsApp? You can place your order directly via WhatsApp.</span>
        <a
          href="https://wa.me/919876543210"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: '#25D366', color: '#fff',
            padding: '0.35rem 0.9rem', borderRadius: '20px',
            fontWeight: 600, fontSize: '0.85rem',
            textDecoration: 'none', whiteSpace: 'nowrap'
          }}
        >
          Chat on WhatsApp
        </a>
      </div>

      {/* ⭐ Today's Specials Section */}
      <section style={{ padding: '3rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Star size={28} fill="#feca57" color="#feca57" />
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-color)' }}>Today's Specials</h2>
        </div>
        
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading kitchen specials...</div>
        ) : specials.length === 0 ? (
          <div style={{ padding: '2rem', backgroundColor: '#f1f2f6', borderRadius: '12px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No specials available at this moment. Check out our full menu!
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            overflowX: 'auto', 
            gap: '1.5rem', 
            paddingBottom: '1rem',
            msOverflowStyle: 'none',  
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch'
          }}>
            {specials.map(item => (
              <div 
                key={item.id} 
                onClick={() => setView('menu')}
                style={{
                  minWidth: '280px',
                  maxWidth: '300px',
                  backgroundColor: '#fff',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '1px solid #feca57',
                  boxShadow: '0 8px 16px rgba(254, 202, 87, 0.2)',
                  transition: 'transform 0.2s ease',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {/* Image Section */}
                <div style={{ height: '160px', backgroundColor: '#f8f9fa', position: 'relative' }}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <Utensils size={40} color="#dfe4ea" />
                    </div>
                  )}
                  <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    backgroundColor: '#fff',
                    color: '#2d3436',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    ₹{item.price?.toFixed(2)}
                  </div>
                </div>
                
                {/* Content Section */}
                <div style={{ padding: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#2d3436', marginBottom: '4px' }}>{item.name}</h3>
                  <p style={{ color: '#636e72', fontSize: '0.85rem', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {item.description || 'Delicious special meal freshly prepared.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* About Section */}
      <section className="about-section" style={{ marginTop: '4rem' }}>
        <div className="about-card card-elevated">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div className="icon-circle">
              <ChefHat size={36} color="var(--primary)" />
            </div>
          </div>
          <h2 className="section-title" style={{ textAlign: 'center' }}>About Our Kitchen</h2>
          <p className="about-text">
            Welcome to HomeEats! Founded by passionate home chefs, we believe that nothing beats the warmth of a home-cooked meal. Whether you are craving a spicy Biryani, a hearty North Indian Thali, or comfort food like Paneer Curry, our mission is to deliver hygienic, premium, and utterly delicious meals straight out of our family kitchen to your dining table.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
