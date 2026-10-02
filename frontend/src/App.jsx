import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RoleSelector from './role-selector/RoleSelector';
import CustomerApp from './customer/CustomerApp';
import CookApp from './cook/CookApp';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 1. Main Role Selector Landing Page */}
        <Route path="/" element={<RoleSelector />} />

        {/* 2. Customer Application Portal */}
        <Route path="/customer/*" element={<CustomerApp />} />

        {/* 3. Cook Application Dashboard */}
        <Route path="/cook/*" element={<CookApp />} />

        {/* 4. Fallback / Wildcard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
