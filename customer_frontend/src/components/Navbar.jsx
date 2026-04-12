import React, { useState } from 'react';
import { ShoppingCart, UtensilsCrossed, FileText, User, Home as HomeIcon, Menu, X, Moon, Sun, ClipboardList } from 'lucide-react';

const Navbar = ({ currentView, setCurrentView, cartItemsCount }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

  const handleNavClick = (view) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    localStorage.setItem('theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  return (
    <header className="navbar-container flex-between" style={{ padding: '1rem 1.5rem', background: 'var(--card-bg)', boxShadow: 'var(--shadow-sm)', position: 'sticky', top: 0, zIndex: 100 }}>
      {/* Logo */}
      <div className="logo" onClick={() => handleNavClick('home')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--secondary)' }}>
        <UtensilsCrossed size={28} color="var(--primary)" />
        HomeEats
      </div>

      {/* Desktop Nav */}
      <nav className="desktop-view hide-on-mobile" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <button className={`nav-link ${currentView === 'home' ? 'active' : ''}`} onClick={() => handleNavClick('home')}>
          <HomeIcon size={18} /><span style={{ marginLeft: '0.4rem' }}>Home</span>
        </button>
        <button className={`nav-link ${currentView === 'menu' ? 'active' : ''}`} onClick={() => handleNavClick('menu')}>
          Menu
        </button>
        <button className={`nav-link ${currentView === 'orders' ? 'active' : ''}`} onClick={() => handleNavClick('orders')}>
          <ClipboardList size={18} /><span style={{ marginLeft: '0.4rem' }}>My Orders</span>
        </button>
        <button className={`nav-link ${currentView === 'track' ? 'active' : ''}`} onClick={() => handleNavClick('track')}>
          <FileText size={18} /><span style={{ marginLeft: '0.4rem' }}>Track</span>
        </button>
        <button className={`nav-link ${currentView === 'profile' ? 'active' : ''}`} onClick={() => handleNavClick('profile')}>
          <User size={20} />
        </button>
        {/* Dark mode toggle */}
        <button className="nav-link" onClick={toggleTheme} title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'} style={{ fontSize: '1.2rem' }}>
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        {/* Cart */}
        <button className={`nav-link ${currentView === 'cart' || currentView === 'checkout' ? 'active' : ''}`} onClick={() => handleNavClick('cart')}>
          <div className="cart-icon-wrapper" style={{ position: 'relative' }}>
            <ShoppingCart size={24} />
            {cartItemsCount > 0 && <span className="cart-badge">{cartItemsCount}</span>}
          </div>
        </button>
      </nav>

      {/* Mobile icons */}
      <div className="mobile-view" style={{ display: 'none', alignItems: 'center', gap: '1rem' }}>
        <button className="nav-link" onClick={toggleTheme}>{isDark ? <Sun size={20} /> : <Moon size={20} />}</button>
        <button className={`nav-link ${currentView === 'cart' || currentView === 'checkout' ? 'active' : ''}`} onClick={() => handleNavClick('cart')}>
          <div className="cart-icon-wrapper" style={{ position: 'relative' }}>
            <ShoppingCart size={24} />
            {cartItemsCount > 0 && <span className="cart-badge">{cartItemsCount}</span>}
          </div>
        </button>
        <button className="nav-link" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {isMobileMenuOpen && (
        <div className="mobile-dropdown" style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--card-bg)', padding: '1rem', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', gap: '1rem', zIndex: 99 }}>
          <button className={`nav-link ${currentView === 'home' ? 'active' : ''}`} onClick={() => handleNavClick('home')}>Home</button>
          <button className={`nav-link ${currentView === 'menu' ? 'active' : ''}`} onClick={() => handleNavClick('menu')}>Menu</button>
          <button className={`nav-link ${currentView === 'orders' ? 'active' : ''}`} onClick={() => handleNavClick('orders')}>My Orders</button>
          <button className={`nav-link ${currentView === 'track' ? 'active' : ''}`} onClick={() => handleNavClick('track')}>Track Order</button>
          <button className={`nav-link ${currentView === 'profile' ? 'active' : ''}`} onClick={() => handleNavClick('profile')}>Profile</button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
