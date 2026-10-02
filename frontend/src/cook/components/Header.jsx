import { useState, useEffect } from 'react';
import { Menu, Bell, Power, AlertCircle, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getIngredients } from '../services/api';

export default function Header({ setIsSidebarOpen }) {
  const navigate = useNavigate();
  const [kitchenStatus, setKitchenStatus] = useState(localStorage.getItem('kitchenStatus') || 'open');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New order #108 received', type: 'order', time: 'Just now', read: false },
    { id: 2, message: 'Low stock: Tomatoes (2 kg left)', type: 'alert', time: '10 mins ago', read: false }
  ]);

  useEffect(() => {
    localStorage.setItem('kitchenStatus', kitchenStatus);
    window.dispatchEvent(new Event('kitchenStatusChanged'));
  }, [kitchenStatus]);

  // Dynamic Low Stock Polling (UI Simulation)
  useEffect(() => {
    getIngredients().then(data => {
      const lowStockItems = data.filter(i => i.quantity <= (i.lowThreshold || 0));
      
      if (lowStockItems.length > 0) {
        setNotifications([
          { id: 1, message: 'New order #108 received', type: 'order', time: 'Just now', read: false },
          ...lowStockItems.map((item, idx) => ({
            id: 100 + idx,
            message: `${item.quantity <= 0 ? 'CRITICAL' : 'Low stock'}: ${item.name} (${item.quantity} ${item.unit} left)`,
            type: 'alert',
            time: 'Now',
            read: false
          }))
        ]);
      }
    }).catch(err => console.error("Could not fetch alerts:", err));
  }, []);

  const toggleKitchenStatus = () => {
    setKitchenStatus(prev => prev === 'open' ? 'closed' : 'open');
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white border-b border-gray-200 z-10 flex-shrink-0">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="font-semibold text-gray-900 text-lg">Food Admin</h1>
        </div>
      </div>
      
      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(prev => !prev)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kitchen Dashboard</h1>
          </div>
        </div>
        <div className="flex items-center gap-5">
          {/* Kitchen Status Toggle */}
          <div className="hidden sm:flex items-center gap-3 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Kitchen</span>
            <button 
              onClick={toggleKitchenStatus}
              className={`relative flex items-center justify-between w-14 h-7 rounded-full p-1 transition-colors duration-300 ${kitchenStatus === 'open' ? 'bg-green-500' : 'bg-red-500'}`}
              title={`Kitchen is ${kitchenStatus}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${kitchenStatus === 'open' ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
            <span className={`text-xs font-black uppercase tracking-wider w-12 ${kitchenStatus === 'open' ? 'text-green-600' : 'text-red-500'}`}>
              {kitchenStatus}
            </span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-all border border-gray-200"
            >
              <Bell className="w-5 h-5 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-40 overflow-hidden text-left">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                  <h3 className="font-bold text-sm text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-800 font-semibold">Mark all read</button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto py-2">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No notifications</p>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => markAsRead(n.id)}
                        className={`px-4 py-3 cursor-pointer transition-colors border-l-4 flex gap-3
                          ${!n.read ? 'bg-blue-50/50 hover:bg-blue-50 border-blue-500' : 'bg-white hover:bg-gray-50 border-transparent'}
                        `}
                      >
                        <div className={`mt-0.5 ${n.type === 'alert' ? 'text-orange-500' : 'text-blue-500'}`}>
                          {n.type === 'alert' ? <AlertCircle className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className={`text-sm ${!n.read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{n.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{n.time}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Section */}
          <div>
            <button 
              onClick={() => navigate('/cook/profile')}
              className="flex items-center gap-3 p-1.5 pr-4 hover:bg-gray-50 rounded-2xl transition-all border border-gray-200 shadow-sm bg-white"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-inner">
                JC
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-sm font-bold text-gray-900 leading-tight">John Cook</p>
                <p className="text-xs text-gray-500 font-medium tracking-wide">Kitchen Master</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
