import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import './customer.css';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Menu from './components/Menu';
import CartDrawer from './components/CartDrawer';
import Checkout from './components/Checkout';
import TrackOrder from './components/TrackOrder';
import Profile from './components/Profile';
import MyOrders from './components/MyOrders';
import Footer from './components/Footer';
import Payment from './components/Payment';

export default function CustomerApp() {
  // Initialise dark mode from localStorage on first load
  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.classList.toggle('dark', saved === 'dark');
  }, []);

  const [currentView, setCurrentView] = useState('home'); // 'home', 'menu', 'checkout', 'track', 'profile', 'orders'
  const [cart, setCart] = useState([]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Intercept cart routing into Drawer
  const handleSetView = (view) => {
    if (view === 'cart') {
      setIsCartDrawerOpen(true);
    } else {
      setCurrentView(view);
    }
  };

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
    showToast('Item added to cart');
  };

  const updateQuantity = (id, delta) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.id === id) {
          const newQuantity = item.quantity + delta;
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => {
        // Automatically remove if quantity hits 0
        if (item.quantity <= 0) {
          setTimeout(() => showToast('Item removed'), 0);
          return false;
        }
        return true;
      });
    });
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    showToast('Item removed');
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="customer-portal App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar currentView={currentView} setCurrentView={handleSetView} cartItemsCount={cartItemsCount} />

      <main className="container" style={{ flex: 1, paddingBottom: '3rem' }}>
        {currentView === 'home' && (
          <Home setView={setCurrentView} />
        )}

        {currentView === 'menu' && (
          <Menu cart={cart} addToCart={addToCart} updateQuantity={updateQuantity} />
        )}
        
        {currentView === 'checkout' && (
          <Checkout 
            cart={cart} 
            setView={handleSetView}
            clearCart={clearCart}
          />
        )}

        {currentView === 'payment' && (
          <Payment setView={handleSetView} clearCart={clearCart} />
        )}

        {currentView === 'track' && (
          <TrackOrder />
        )}

        {currentView === 'profile' && (
          <Profile setView={handleSetView} />
        )}

        {currentView === 'orders' && (
          <MyOrders setView={handleSetView} />
        )}
      </main>

      <Footer />
      
      {/* Floating Cart Button */}
      {cartItemsCount > 0 && currentView !== 'checkout' && !isCartDrawerOpen && (
        <button
          id="floating-cart-btn"
          className="floating-cart-btn"
          onClick={() => setIsCartDrawerOpen(true)}
        >
          <ShoppingCart size={22} />
          <span>{cartItemsCount} {cartItemsCount === 1 ? 'Item' : 'Items'} · View Cart</span>
        </button>
      )}

      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={isCartDrawerOpen} 
        setIsOpen={setIsCartDrawerOpen} 
        cart={cart} 
        updateQuantity={updateQuantity} 
        setView={handleSetView}
      />

      {toastMessage && (
        <div className="toast-notification animate-fade-in">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
