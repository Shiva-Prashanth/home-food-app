import React, { useState, useEffect } from 'react';
import { getMenu } from '../services/api';
import { Utensils, AlertCircle } from 'lucide-react';
import MenuItemCard from './MenuItemCard';
import KitchenStatusBanner from './KitchenStatusBanner';

const Menu = ({ addToCart }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

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

  // Filter by selected category
  const filteredItems = selectedCategory === 'All'
    ? availableItems
    : availableItems.filter(item => item.category === selectedCategory);

  return (
    <div className="animate-fade-in">
      <KitchenStatusBanner />
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
            <div className="empty-state">
              <h3>No items in {selectedCategory} category.</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map(item => (
                <MenuItemCard 
                  key={item.id} 
                  item={item} 
                  handleAddToCart={handleAddToCart}
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
