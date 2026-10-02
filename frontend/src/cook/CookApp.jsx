import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import './styles/index.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Menu from './pages/Menu';
import Ingredients from './pages/Ingredients';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Feedback from './pages/Feedback';

export default function CookApp() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="cook-portal flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header setIsSidebarOpen={setIsSidebarOpen} />
        
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Dashboard setIsSidebarOpen={setIsSidebarOpen} />} />
            <Route path="orders" element={<Orders />} />
            <Route path="menu" element={<Menu />} />
            <Route path="ingredients" element={<Ingredients />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="feedback" element={<Feedback />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
