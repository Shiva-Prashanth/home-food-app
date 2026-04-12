import React from 'react';
import { UtensilsCrossed, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ 
      background: 'var(--card-bg)', borderTop: '1px solid var(--border-color)', 
      padding: '4rem 0 1.5rem', marginTop: 'auto' 
    }}>
      <div className="layout-container" style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '3rem', marginBottom: '2rem' 
      }}>
        
        {/* Brand */}
        <div>
          <div className="logo" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.5rem', color: 'var(--text-color)' }}>
            <UtensilsCrossed size={28} color="var(--primary)" />
            HomeEats
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
            Delivering authentic, hygienic, and utterly delicious homemade meals right to your doorstep.
          </p>
        </div>

        {/* Contact info */}
        <div>
          <h4 style={{ marginBottom: '1.2rem', color: 'var(--secondary)' }}>Contact Us</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-muted)' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.8rem' }}>
              <Phone size={18} /> +91 98765 43210
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.8rem' }}>
              <Mail size={18} /> hello@homeeats.in
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <MapPin size={18} /> Serving Hyderabad & Secunderabad
            </li>
          </ul>
        </div>

        {/* Social Links placeholder (Icons removed due to versioning) */}
        <div>
          <h4 style={{ marginBottom: '1.2rem', color: 'var(--secondary)' }}>Connect With Us</h4>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>Instagram</a>
            <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>Twitter</a>
            <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>Facebook</a>
          </div>
        </div>
      </div>

      <div className="layout-container" style={{ 
        borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', 
        textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem',
        display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center'
      }}>
        <div style={{ fontWeight: '500', color: 'var(--secondary)' }}>
          100% Quality Ingredients • Hygienic Kitchen • Fast Delivery
        </div>
        <div>&copy; {new Date().getFullYear()} HomeEats. All rights reserved.</div>
      </div>
    </footer>
  );
};

export default Footer;
