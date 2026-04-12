import React, { useState, useEffect } from 'react';
import { getMenu } from '../services/api';
import { Utensils, AlertCircle } from 'lucide-react';
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
      console.log('Menu data:', data);
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
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <Utensils size={48} color="var(--primary)" style={{ opacity: 0.4, marginBottom: '1rem' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Preparing today's fresh menu...</p>
      </div>
    );
  }

  if (error && menuItems.length === 0) {
    return (
      <div className="animate-fade-in" style={{ padding: '3rem', textAlign: 'center', background: 'var(--card-bg)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', marginTop: '2rem' }}>
        <AlertCircle size={48} color="var(--error)" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ marginBottom: '0.5rem' }}>Oops!</h3>
        <p style={{ color: 'var(--text-muted)' }}>{error}</p>
        <button className="btn" style={{ marginTop: '1.5rem' }} onClick={fetchMenuData}>Try Again</button>
      </div>
    );
  }

  // Only show available items
  const availableItems = menuItems.filter(item => item.isAvailable === true);

  // Build dynamic category list from real data
  const activeCategories = ['All', ...new Set(availableItems.map(item => item.category).filter(Boolean))];

  // Combined filtering: Category + Search
  const filteredItems = availableItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="menu-header">
        <h2 className="page-title">Our Live Menu</h2>
        <p className="page-subtitle">Fresh items updated in real-time from our kitchen.</p>
      </div>

      {availableItems.length === 0 ? (
        <div className="empty-state">
          <Utensils size={48} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.3 }} />
          <h3>No dishes available right now!</h3>
          <p>The kitchen is preparing a new batch. Please check back soon.</p>
        </div>
      ) : (
        <>
          {/* Search Bar */}
          <div style={{ marginBottom: '1.5rem', width: '100%' }}>
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
              style={{ padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '1rem' }}
            />
          </div>

          {/* Category Filter Pills */}
          <div className="category-filters" style={{ marginBottom: '2.5rem', justifyContent: 'flex-start' }}>
            <div className="filter-chips">
              {activeCategories.map(cat => (
                <button
                  key={cat}
                  className={`chip ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Item count */}
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} available
          </p>

          {/* Core Grid Implementation */}
          {filteredItems.length === 0 ? (
            <div className="empty-state" style={{ padding: '3rem 1rem' }}>
              <Utensils size={40} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.2 }} />
              <h3>No items found for "{searchQuery}"</h3>
              <p>Try searching something else 🍽</p>
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
