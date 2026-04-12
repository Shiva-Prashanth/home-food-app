import React, { useState, useEffect } from 'react';
import { ArrowRight, Star, ChefHat, Utensils, Clock, Shield, Zap } from 'lucide-react';
import { getMenu } from '../services/api';
import KitchenStatusBanner from './KitchenStatusBanner';

const FEATURES = [
  { icon: '🏠', label: 'Homemade Quality' },
  { icon: '⚡', label: 'Fast Delivery' },
  { icon: '🌿', label: 'Fresh Ingredients' },
  { icon: '❤️', label: 'Cooked with Love' },
];

const Home = ({ setView }) => {
  const [specials, setSpecials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpecials = async () => {
      try {
        const data = await getMenu();
        const specialItems = data.filter(item => item.isAvailable && item.isSpecial);
        setSpecials(specialItems);
      } catch (err) {
        console.error('Failed to load specials:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSpecials();
  }, []);

  return (
    <div className="animate-fade-in" style={{ paddingTop: 0 }}>
      {/* Kitchen Status */}
      <KitchenStatusBanner />

      {/* ── Hero Section ── */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Authentic Homemade Food,<br />Delivered Fresh.
          </h1>
          <p className="hero-subtitle">
            Experience the rich taste of traditional cooking right at your doorstep.
            Every meal prepared with love, using locally sourced ingredients and time-honored recipes.
          </p>

          {/* Feature Pills */}
          <div className="hero-features">
            {FEATURES.map(({ icon, label }) => (
              <div key={label} className="feature-pill">
                <span>{icon}</span>
                {label}
              </div>
            ))}
          </div>

          <div className="hero-actions">
            <button
              id="hero-order-btn"
              className="btn btn-large"
              onClick={() => setView('menu')}
            >
              Order Now <ArrowRight size={20} />
            </button>
            <button
              id="hero-track-btn"
              className="btn-secondary btn-large"
              onClick={() => setView('track')}
            >
              Track Order
            </button>
          </div>
        </div>

        <div className="hero-image-wrapper">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=85"
            alt="Delicious homemade food spread"
            className="hero-image"
            loading="eager"
          />
        </div>
      </section>

      {/* ── WhatsApp Strip ── */}
      <div className="whatsapp-strip">
        <span style={{ fontSize: '1.1rem' }}>📱</span>
        <span>Prefer WhatsApp? Place your order directly via chat!</span>
        <a
          href="https://wa.me/919876543210"
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-cta"
        >
          Chat on WhatsApp
        </a>
      </div>

      {/* ── Today's Specials ── */}
      <section className="specials-section">
        <div className="specials-header">
          <Star size={30} fill="#fbbf24" color="#fbbf24" />
          <h2 className="specials-title">Today's Specials</h2>
        </div>

        {loading ? (
          <div style={{ display: 'flex', gap: '1.5rem', overflow: 'hidden' }}>
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="skeleton"
                style={{ minWidth: 270, height: 280, borderRadius: 20, flexShrink: 0 }}
              />
            ))}
          </div>
        ) : specials.length === 0 ? (
          <div style={{
            padding: '2.5rem',
            background: 'var(--bg-alt)',
            borderRadius: 16,
            textAlign: 'center',
            color: 'var(--text-muted)',
            border: '1px dashed var(--border-color)',
          }}>
            <Utensils size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
            <p style={{ fontWeight: 500 }}>No specials right now. Check out our full menu!</p>
          </div>
        ) : (
          <div className="specials-scroll">
            {specials.map(item => (
              <div
                key={item.id}
                id={`special-card-${item.id}`}
                className="special-card"
                onClick={() => setView('menu')}
              >
                <div className="special-card-img-wrap">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="special-card-img"
                      onError={e => (e.target.style.display = 'none')}
                    />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      background: 'var(--bg-color)',
                    }}>
                      <Utensils size={44} color="var(--border-color)" />
                    </div>
                  )}
                  <div className="special-card-price">₹{item.price?.toFixed(2)}</div>
                  <div className="special-badge">
                    <Star size={9} fill="#fff" /> Special
                  </div>
                </div>
                <div className="special-card-body">
                  <h3>{item.name}</h3>
                  <p>{item.description || 'Freshly prepared special meal.'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Why Choose Us ── */}
      <section style={{ padding: '2rem 0 3rem' }}>
        <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          Why HomeEats?
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
        }}>
          {[
            { icon: <ChefHat size={28} color="var(--primary)" />, title: 'Expert Home Chefs', desc: 'Meals cooked by experienced home chefs with decades of culinary tradition.' },
            { icon: <Clock size={28} color="var(--primary)" />, title: 'Fast Delivery', desc: 'Hot meals delivered within 30–45 minutes from our kitchen to your door.' },
            { icon: <Shield size={28} color="var(--primary)" />, title: 'Hygienic & Safe', desc: 'Strict hygiene standards maintained at all stages of food preparation.' },
            { icon: <Zap size={28} color="var(--primary)" />, title: 'Fresh Every Day', desc: 'Daily menu refreshed with seasonal locally-sourced ingredients.' },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              style={{
                background: 'var(--card-bg)',
                borderRadius: 18,
                padding: '1.75rem 1.5rem',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-card)',
                transition: 'var(--transition)',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = 'var(--shadow)';
                e.currentTarget.style.borderColor = 'rgba(249,115,22,0.2)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <div className="icon-circle" style={{ width: 56, height: 56, marginBottom: '1rem' }}>{icon}</div>
              <h4 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--secondary)' }}>{title}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── About Section ── */}
      <section className="about-section">
        <div className="about-card card-elevated">
          <div className="icon-circle" style={{ margin: '0 auto 1.5rem' }}>
            <ChefHat size={34} color="var(--primary)" />
          </div>
          <h2 className="section-title" style={{ textAlign: 'center' }}>About Our Kitchen</h2>
          <p className="about-text">
            Welcome to <strong>HomeEats!</strong> Founded by passionate home chefs, we believe that nothing beats
            the warmth of a home-cooked meal. Whether you're craving a spicy Biryani, a hearty North Indian Thali,
            or comfort food like Paneer Curry — our mission is to deliver hygienic, premium, and utterly delicious
            meals straight out of our family kitchen to your dining table.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
