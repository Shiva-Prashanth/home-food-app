import React, { useState } from 'react';
import { ShoppingCart, UtensilsCrossed, FileText, User, Home as HomeIcon } from 'lucide-react';
import Home from './components/Home';
import Menu from './components/Menu';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import TrackOrder from './components/TrackOrder';
import Profile from './components/Profile';
import Footer from './components/Footer';

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'menu', 'cart', 'checkout', 'track', 'profile'
  const [cart, setCart] = useState([]);
  const [trackingOrderId, setTrackingOrderId] = useState('');

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.id === id) {
          const newQuantity = item.quantity + delta;
          return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 };
        }
        return item;
      });
    });
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header>
        <div className="logo" onClick={() => setCurrentView('home')}>
          <UtensilsCrossed size={28} color="var(--primary)" />
          HomeEats
        </div>
        <nav style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button 
            className={`nav-link ${currentView === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentView('home')}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: '0.4rem'}}>
              <HomeIcon size={20} />
            </div>
          </button>
          <button 
            className={`nav-link ${currentView === 'menu' ? 'active' : ''}`}
            onClick={() => setCurrentView('menu')}
          >
            Menu
          </button>
          <button 
            className={`nav-link ${currentView === 'track' ? 'active' : ''}`}
            onClick={() => setCurrentView('track')}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: '0.4rem'}}>
              <FileText size={20} />
              <span className="hide-on-mobile">Track</span>
            </div>
          </button>
          <button 
            className={`nav-link ${currentView === 'profile' ? 'active' : ''}`}
            onClick={() => setCurrentView('profile')}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: '0.4rem'}}>
              <User size={20} />
            </div>
          </button>
          <button 
            className={`nav-link ${currentView === 'cart' || currentView === 'checkout' ? 'active' : ''}`}
            onClick={() => setCurrentView('cart')}
          >
            <div className="cart-icon-wrapper">
              <ShoppingCart size={24} />
              {cartItemsCount > 0 && (
                <span className="cart-badge">{cartItemsCount}</span>
              )}
            </div>
          </button>
        </nav>
      </header>

      <main className="container" style={{ flex: 1, paddingBottom: '3rem' }}>
        {currentView === 'home' && (
          <Home setView={setCurrentView} />
        )}

        {currentView === 'menu' && (
          <Menu addToCart={addToCart} />
        )}
        
        {currentView === 'cart' && (
          <Cart 
            cart={cart} 
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart} 
            setView={setCurrentView} 
          />
        )}
        
        {currentView === 'checkout' && (
          <Checkout 
            cart={cart} 
            setView={setCurrentView}
            clearCart={clearCart}
          />
        )}

        {currentView === 'track' && (
          <TrackOrder />
        )}

        {currentView === 'profile' && (
          <Profile setView={setCurrentView} />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
