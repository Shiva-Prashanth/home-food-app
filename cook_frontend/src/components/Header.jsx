import { useState } from 'react';
import { Menu, Bell, ChevronDown, LogOut } from 'lucide-react';

export default function Header({ setIsSidebarOpen }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

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
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-all border border-gray-200"
            >
              <Bell className="w-5 h-5 text-gray-700" />
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                2
              </span>
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-40 overflow-hidden text-left">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                  <h3 className="font-bold text-sm text-gray-900">Notifications</h3>
                </div>
                <div className="py-2">
                  <div className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-l-4 border-blue-500">
                    <p className="text-sm font-semibold text-gray-900">New order received</p>
                    <p className="text-xs text-gray-500 mt-1">Just now</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-t border-gray-50 transition-colors">
                    <p className="text-sm font-medium text-gray-800">Order #123 pending</p>
                    <p className="text-xs text-gray-500 mt-1">5 mins ago</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile Section */}
          <div className="relative">
            <button 
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-3 p-1.5 pr-4 hover:bg-gray-50 rounded-2xl transition-all border border-gray-200 shadow-sm bg-white"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-inner">
                JC
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-sm font-bold text-gray-900 leading-tight">John Cook</p>
                <p className="text-xs text-gray-500 font-medium tracking-wide">Kitchen Master</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden lg:block ml-1" />
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-40 py-2 overflow-hidden">
                <button className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
