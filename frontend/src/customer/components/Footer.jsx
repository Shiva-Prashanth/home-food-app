import React from 'react';
import { UtensilsCrossed, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer>
      <div className="footer-inner">
        {/* Brand */}
        <div>
          <div className="footer-logo">
            <UtensilsCrossed size={24} color="var(--primary)" />
            HomeEats
          </div>
          <p className="footer-desc">
            Delivering authentic, hygienic, and utterly delicious homemade meals right to your doorstep. Cooked with love by passionate home chefs.
          </p>
        </div>

        {/* Contact */}
        <div>
          <h4 className="footer-heading">Contact Us</h4>
          <ul className="footer-list">
            <li>
              <Phone size={16} color="var(--accent)" />
              +91 98765 43210
            </li>
            <li>
              <Mail size={16} color="var(--accent)" />
              hello@homeeats.in
            </li>
            <li>
              <MapPin size={16} color="var(--accent)" />
              Serving Hyderabad &amp; Secunderabad
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-list" style={{ cursor: 'pointer' }}>
            <li>🍽 Full Menu</li>
            <li>📦 Track Order</li>
            <li>👤 My Profile</li>
            <li>📋 My Orders</li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h4 className="footer-heading">Follow Us</h4>
          <div className="footer-social-links">
            <a href="#" className="footer-social-link" title="Instagram">📸 Insta</a>
            <a href="#" className="footer-social-link" title="Twitter / X">🐦 Twitter</a>
            <a href="#" className="footer-social-link" title="Facebook">👍 FB</a>
          </div>
          <p style={{ color: '#5a4030', fontSize: '0.82rem', marginTop: '1rem', lineHeight: 1.6 }}>
            Stay updated with our daily specials and new menu items by following us!
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="footer-badges">
          <span className="footer-badge">🏠 100% Homemade</span>
          <span className="footer-badge">🌿 Fresh Ingredients</span>
          <span className="footer-badge">🛡 Hygienic Kitchen</span>
          <span className="footer-badge">⚡ Fast Delivery</span>
        </div>
        <div>© {year} HomeEats. All rights reserved. Made with ❤️ in Hyderabad.</div>
      </div>
    </footer>
  );
};

export default Footer;
