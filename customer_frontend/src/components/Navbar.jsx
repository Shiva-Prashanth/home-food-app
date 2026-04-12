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
    <header className="navbar-container flex-between" style={{ position: 'sticky', top: 0, zIndex: 200 }}>
      {/* Logo */}
      <div className="navbar-logo" onClick={() => handleNavClick('home')}>
        <div className="logo-icon">
          <UtensilsCrossed size={20} color="white" />
        </div>
        HomeEats
      </div>

      {/* Desktop Nav */}
      <nav className="desktop-view hide-on-mobile" style={{ display: 'flex', gap: '0.15rem', alignItems: 'center' }}>
        <button
          className={`nav-link ${currentView === 'home' ? 'active' : ''}`}
          onClick={() => handleNavClick('home')}
        >
          <HomeIcon size={16} />
          <span>Home</span>
        </button>
        <button
          className={`nav-link ${currentView === 'menu' ? 'active' : ''}`}
          onClick={() => handleNavClick('menu')}
        >
          <UtensilsCrossed size={16} />
          <span>Menu</span>
        </button>
        <button
          className={`nav-link ${currentView === 'orders' ? 'active' : ''}`}
          onClick={() => handleNavClick('orders')}
        >
          <ClipboardList size={16} />
          <span>My Orders</span>
        </button>
        <button
          className={`nav-link ${currentView === 'track' ? 'active' : ''}`}
          onClick={() => handleNavClick('track')}
        >
          <FileText size={16} />
          <span>Track</span>
        </button>
        <button
          className={`nav-link ${currentView === 'profile' ? 'active' : ''}`}
          onClick={() => handleNavClick('profile')}
        >
          <User size={17} />
        </button>

        {/* Dark mode toggle */}
        <button
          className="nav-link"
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Cart */}
        <button
          className={`nav-link ${currentView === 'cart' || currentView === 'checkout' ? 'active' : ''}`}
          onClick={() => handleNavClick('cart')}
          style={{
            background: cartItemsCount > 0 ? 'var(--primary-light)' : undefined,
            color: cartItemsCount > 0 ? 'var(--primary)' : undefined,
            paddingLeft: '0.9rem',
            paddingRight: '0.9rem',
          }}
        >
          <div className="cart-icon-wrapper">
            <ShoppingCart size={20} />
            {cartItemsCount > 0 && (
              <span className="cart-badge">{cartItemsCount}</span>
            )}
          </div>
        </button>
      </nav>

      {/* Mobile icons */}
      <div className="mobile-view" style={{ display: 'none', alignItems: 'center', gap: '0.75rem' }}>
        <button className="nav-link" onClick={toggleTheme}>
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button
          className={`nav-link ${currentView === 'cart' || currentView === 'checkout' ? 'active' : ''}`}
          onClick={() => handleNavClick('cart')}
        >
          <div className="cart-icon-wrapper">
            <ShoppingCart size={22} />
            {cartItemsCount > 0 && <span className="cart-badge">{cartItemsCount}</span>}
          </div>
        </button>
        <button className="nav-link" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {isMobileMenuOpen && (
        <div className="mobile-dropdown">
          {[
            { view: 'home',   label: 'Home',      Icon: HomeIcon },
            { view: 'menu',   label: 'Menu',       Icon: UtensilsCrossed },
            { view: 'orders', label: 'My Orders',  Icon: ClipboardList },
            { view: 'track',  label: 'Track Order', Icon: FileText },
            { view: 'profile',label: 'Profile',    Icon: User },
          ].map(({ view, label, Icon }) => (
            <button
              key={view}
              className={`nav-link ${currentView === view ? 'active' : ''}`}
              onClick={() => handleNavClick(view)}
              style={{ justifyContent: 'flex-start', padding: '0.65rem 0.9rem' }}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};

export default Navbar;
