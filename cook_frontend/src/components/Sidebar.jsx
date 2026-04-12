import { Link, useLocation } from 'react-router';
import { LayoutDashboard, ShoppingBag, BarChart3, Package, Utensils } from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '🏠 Dashboard' },
    { path: '/orders', label: '📦 Orders' },
    { path: '/menu', label: '🍽 Menu' },
    { path: '/analytics', label: '📊 Insights' },
    { path: '/ingredients', label: '🧺 Kitchen Inventory' },
    { path: '/feedback', label: '💬 Feedback' },
    { path: '/profile', label: '👤 Profile' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <aside
        className={`fixed md:static inset-y-0 left-0 z-20 bg-white transition-all duration-300 flex flex-col flex-shrink-0 overflow-hidden ${
          isOpen ? 'w-64 border-r border-gray-200 translate-x-0' : 'w-0 border-r-0 -translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg" />
            <h1 className="text-xl font-semibold text-gray-900">Food Admin</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">Cook Dashboard</p>
        </div>
        <nav className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-1.5">
            {navItems.map((item) => {
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-green-50 text-green-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-medium text-[15px]">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-10 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
