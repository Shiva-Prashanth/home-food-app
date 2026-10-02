import React, { useState } from 'react';
import { menuItems } from '../data';
import { PlusCircle, Search, Filter } from 'lucide-react';

const FoodList = ({ addToCart }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Extract unique categories from data
  const categories = ['All', ...new Set(menuItems.map(item => item.category))];

  // Filter items based on search and selected category
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="animate-fade-in content-padding">
      <div className="menu-header">
        <h2 className="page-title">Explore Our Menu</h2>
        <p className="page-subtitle">Discover our delicious range of freshly cooked meals.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="menu-controls">
        <div className="search-bar-wrapper">
          <Search size={20} className="search-icon" color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search for your favorite food..." 
            className="search-input form-control"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="category-filters">
          <Filter size={18} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
          <div className="filter-chips">
            {categories.map(category => (
              <button 
                key={category}
                className={`chip ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid rendering */}
      {filteredItems.length === 0 ? (
        <div className="empty-state">
          <h3>No dishes found!</h3>
          <p>Try searching for something else or clearing your filters.</p>
        </div>
      ) : (
        <div className="menu-grid">
          {filteredItems.map(item => (
            <div key={item.id} className="food-card">
              <div className="food-image-wrapper">
                <img src={item.image} alt={item.name} className="food-image" />
                <div className="food-price-badge">${item.price.toFixed(2)}</div>
                {item.category && <div className="food-category-badge">{item.category}</div>}
              </div>
              
              <div className="food-content">
                <h3 className="food-title">{item.name}</h3>
                <p className="food-desc">{item.description}</p>
                
                <button 
                  className="btn btn-block"
                  onClick={() => addToCart(item)}
                >
                  <PlusCircle size={18} />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FoodList;
