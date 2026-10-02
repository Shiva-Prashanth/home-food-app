import React, { useState, useEffect } from 'react';
import { getMenu } from '../services/api';
import { Utensils, AlertCircle, Search } from 'lucide-react';
import MenuItemCard from './MenuItemCard';

const Menu = ({ cart, addToCart, updateQuantity }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMenuData = async () => {
    try {
      const data = await getMenu();
      setMenuItems(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Unable to load the menu at this moment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
    const intervalId = setInterval(fetchMenuData, 15000);
    return () => clearInterval(intervalId);
  }, []);

  const handleAddToCart = (item) => {
    addToCart(item);
  };

  if (loading) {
    return (
      <div
        className="animate-fade-in"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '55vh', gap: '1rem' }}
      >
        <div style={{ position: 'relative' }}>
          <Utensils size={52} color="var(--primary)" style={{ opacity: 0.3 }} />
          <div style={{
            position: 'absolute',
            inset: -6,
            borderRadius: '50%',
            border: '3px solid var(--primary)',
            borderTopColor: 'transparent',
            animation: 'spin 1s linear infinite',
          }} />
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
          Preparing today's fresh menu…
        </p>

        {/* Skeleton cards */}
        <div className="grid-cards" style={{ width: '100%', maxWidth: 900, marginTop: '2rem' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              <div className="skeleton" style={{ height: 170 }} />
              <div style={{ padding: '1rem' }}>
                <div className="skeleton" style={{ height: 16, borderRadius: 8, marginBottom: 8, width: '70%' }} />
                <div className="skeleton" style={{ height: 12, borderRadius: 6, marginBottom: 6, width: '90%' }} />
                <div className="skeleton" style={{ height: 12, borderRadius: 6, width: '60%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && menuItems.length === 0) {
    return (
      <div className="animate-fade-in" style={{
        padding: '3rem',
        textAlign: 'center',
        background: 'var(--card-bg)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)',
        marginTop: '2rem',
        border: '1px solid var(--border-color)',
      }}>
        <AlertCircle size={52} color="var(--error)" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ marginBottom: '0.5rem', fontFamily: 'Poppins, sans-serif' }}>Oops!</h3>
        <p style={{ color: 'var(--text-muted)' }}>{error}</p>
        <button className="btn" style={{ marginTop: '1.5rem' }} onClick={fetchMenuData}>
          Try Again
        </button>
      </div>
    );
  }

  const availableItems = menuItems.filter(item => item.isAvailable === true);
  const activeCategories = ['All', ...new Set(availableItems.map(item => item.category).filter(Boolean))];

  const filteredItems = availableItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="menu-header">
        <h1 className="page-title">Our Live Menu</h1>
        <p className="page-subtitle">Fresh items updated in real-time from our kitchen.</p>
      </div>

      {availableItems.length === 0 ? (
        <div className="empty-state">
          <Utensils size={52} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.2 }} />
          <h3>No dishes available right now!</h3>
          <p>The kitchen is preparing a new batch. Please check back soon. 🍳</p>
        </div>
      ) : (
        <>
          {/* Search + Filter Controls */}
          <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Search Bar */}
            <div className="search-bar-wrapper">
              <Search size={18} className="search-icon" />
              <input
                id="menu-search"
                type="text"
                placeholder="Search dishes, ingredients…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="category-filters">
              <div className="filter-chips">
                {activeCategories.map(cat => (
                  <button
                    key={cat}
                    id={`category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                    className={`chip ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Item count */}
          <p style={{
            color: 'var(--text-muted)',
            marginBottom: '1.5rem',
            fontWeight: 600,
            fontSize: '0.88rem',
            letterSpacing: '0.02em',
          }}>
            Showing {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
            {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>

          {/* Menu Grid */}
          {filteredItems.length === 0 ? (
            <div className="empty-state" style={{ padding: '3.5rem 1rem' }}>
              <Utensils size={44} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.2 }} />
              <h3>No items found</h3>
              <p>Try a different search or category 🍽</p>
            </div>
          ) : (
            <div className="grid-cards">
              {filteredItems.map(item => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  cart={cart}
                  handleAddToCart={handleAddToCart}
                  updateQuantity={updateQuantity}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Menu;
