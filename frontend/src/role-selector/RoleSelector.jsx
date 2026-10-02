import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UtensilsCrossed, 
  ChefHat, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  RefreshCw
} from 'lucide-react';
import './role-selector.css';

export default function RoleSelector() {
  const navigate = useNavigate();
  const [navigatingRole, setNavigatingRole] = useState(null);

  const handleRoleSelect = (role) => {
    // Store selected role in localStorage for lightweight session memory
    try {
      localStorage.setItem('homefood_selected_role', role);
    } catch {
      // Ignore if localStorage unavailable
    }

    setNavigatingRole(role);

    // Smooth internal transition
    setTimeout(() => {
      if (role === 'customer') {
        navigate('/customer');
      } else if (role === 'cook') {
        navigate('/cook');
      }
    }, 150);
  };

  return (
    <div className="selector-layout">
      {/* ── Main Content Container ── */}
      <div>
        {/* Header */}
        <header className="selector-header">
          <div className="brand-badge">
            <Sparkles size={15} />
            <span>Home Food Ordering System</span>
          </div>
          <h1 className="selector-title">
            Welcome to <span className="title-highlight">Home Food</span>
          </h1>
          <p className="selector-subtitle">
            Choose your role to enter the appropriate portal and get started.
          </p>
        </header>

        {/* ── Role Selection Cards ── */}
        <main className="cards-container" aria-label="Role Selection Options">
          {/* CUSTOMER CARD */}
          <section
            className="role-card customer"
            aria-labelledby="customer-role-title"
          >
            <div>
              <div className="role-icon-box">
                <UtensilsCrossed size={36} />
              </div>
              <span className="role-tag">Ordering Experience</span>
              <h2 id="customer-role-title" className="role-name">
                Customer
              </h2>
              <p className="role-description">
                Browse homemade food, place orders and track your delivery.
              </p>

              <ul className="feature-list" aria-label="Customer features">
                <li className="feature-item">
                  <span className="feature-dot" />
                  <span>Browse fresh homemade daily menus</span>
                </li>
                <li className="feature-item">
                  <span className="feature-dot" />
                  <span>Cart management & instant checkout</span>
                </li>
                <li className="feature-item">
                  <span className="feature-dot" />
                  <span>Real-time live delivery tracking</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              id="continue-as-customer-btn"
              className="role-button"
              disabled={navigatingRole === 'customer'}
              onClick={() => handleRoleSelect('customer')}
              aria-label="Continue as Customer"
            >
              {navigatingRole === 'customer' ? (
                <>
                  <RefreshCw size={20} className="spinner" />
                  <span>Entering Customer Portal...</span>
                </>
              ) : (
                <>
                  <span>Continue as Customer</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </section>

          {/* COOK CARD */}
          <section
            className="role-card cook"
            aria-labelledby="cook-role-title"
          >
            <div>
              <div className="role-icon-box">
                <ChefHat size={36} />
              </div>
              <span className="role-tag">Kitchen Management</span>
              <h2 id="cook-role-title" className="role-name">
                Cook
              </h2>
              <p className="role-description">
                Manage your menu, orders, ingredients and kitchen.
              </p>

              <ul className="feature-list" aria-label="Cook features">
                <li className="feature-item">
                  <span className="feature-dot" />
                  <span>Live order processing dashboard</span>
                </li>
                <li className="feature-item">
                  <span className="feature-dot" />
                  <span>Menu item availability & pricing</span>
                </li>
                <li className="feature-item">
                  <span className="feature-dot" />
                  <span>Kitchen inventory & ingredient tracking</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              id="continue-as-cook-btn"
              className="role-button"
              disabled={navigatingRole === 'cook'}
              onClick={() => handleRoleSelect('cook')}
              aria-label="Continue as Cook"
            >
              {navigatingRole === 'cook' ? (
                <>
                  <RefreshCw size={20} className="spinner" />
                  <span>Entering Cook Dashboard...</span>
                </>
              ) : (
                <>
                  <span>Continue as Cook</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </section>
        </main>
      </div>

      {/* ── Footer / Environment Information ── */}
      <footer className="selector-footer">
        <div>
          <span>Home Food Multi-Portal Platform · Single Unified Deployment</span>
        </div>
        <div className="footer-endpoints">
          <span className="endpoint-badge" title="Customer Portal Route">
            Customer: /customer
          </span>
          <span className="endpoint-badge" title="Cook Dashboard Route">
            Cook: /cook
          </span>
        </div>
      </footer>
    </div>
  );
}
