import React, { useState } from 'react';
import { 
  UtensilsCrossed, 
  ChefHat, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink,
  ShoppingBag,
  CookingPot
} from 'lucide-react';
import { CONFIG } from './config';

export default function App() {
  const [checkingRole, setCheckingRole] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [failedUrl, setFailedUrl] = useState(null);

  const handleRoleSelect = async (role) => {
    const targetUrl = role === 'customer' ? CONFIG.customerUrl : CONFIG.cookUrl;
    const roleTitle = role === 'customer' ? 'Customer' : 'Cook';

    // Store selected role in localStorage for lightweight session memory
    try {
      localStorage.setItem('homefood_selected_role', role);
    } catch {
      // Ignore if localStorage unavailable
    }

    setCheckingRole(role);
    setErrorMessage(null);
    setFailedUrl(null);

    try {
      // Lightweight check with 1.8s timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1800);

      // In browser, fetching localhost across ports in 'no-cors' mode
      // succeeds if the server is up and listening.
      await fetch(targetUrl, {
        method: 'GET',
        mode: 'no-cors',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Server is running, open the application
      window.location.href = targetUrl;
    } catch {
      setCheckingRole(null);
      setFailedUrl(targetUrl);
      setErrorMessage(
        `${roleTitle} application is currently unavailable. Please make sure the ${roleTitle.toLowerCase()} frontend is running.`
      );
    }
  };

  const handleForceOpen = (url) => {
    window.location.href = url;
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

        {/* Graceful Error Notification */}
        {errorMessage && (
          <div className="status-alert" role="alert">
            <AlertCircle size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600 }}>{errorMessage}</p>
              <div className="status-alert-actions">
                <button
                  type="button"
                  className="status-alert-btn"
                  onClick={() => setErrorMessage(null)}
                >
                  Dismiss
                </button>
                {failedUrl && (
                  <button
                    type="button"
                    className="status-alert-btn"
                    onClick={() => handleForceOpen(failedUrl)}
                  >
                    Open Anyway <ExternalLink size={12} style={{ display: 'inline', marginLeft: 4 }} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

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
              disabled={checkingRole === 'customer'}
              onClick={() => handleRoleSelect('customer')}
              aria-label="Continue as Customer"
            >
              {checkingRole === 'customer' ? (
                <>
                  <RefreshCw size={20} className="spinner" />
                  <span>Connecting to Customer Portal...</span>
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
              disabled={checkingRole === 'cook'}
              onClick={() => handleRoleSelect('cook')}
              aria-label="Continue as Cook"
            >
              {checkingRole === 'cook' ? (
                <>
                  <RefreshCw size={20} className="spinner" />
                  <span>Connecting to Cook Dashboard...</span>
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
          <span>Home Food Multi-Portal Platform · Single Shared Backend</span>
        </div>
        <div className="footer-endpoints">
          <span className="endpoint-badge" title="Customer Frontend URL">
            Customer: {CONFIG.customerUrl}
          </span>
          <span className="endpoint-badge" title="Cook Frontend URL">
            Cook: {CONFIG.cookUrl}
          </span>
          <span className="endpoint-badge" title="Backend API URL">
            Backend: {CONFIG.backendUrl}
          </span>
        </div>
      </footer>
    </div>
  );
}
