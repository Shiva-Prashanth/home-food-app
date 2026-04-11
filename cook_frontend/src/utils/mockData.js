export const mockStats = {
  totalOrders: 156,
  activeOrders: 12,
  completedOrders: 144,
  earnings: 4850.50,
};

export const mockOrders = [
  {
    id: '1',
    customerName: 'Sarah Johnson',
    items: [
      { id: '1', name: 'Chicken Biryani', quantity: 2, price: 12.99 },
      { id: '2', name: 'Mango Lassi', quantity: 2, price: 3.99 },
    ],
    totalPrice: 33.96,
    status: 'pending',
    priority: 'high',
    timestamp: new Date(2026, 3, 10, 14, 30),
  },
  {
    id: '2',
    customerName: 'Michael Chen',
    items: [
      { id: '3', name: 'Veggie Pizza', quantity: 1, price: 14.99 },
    ],
    totalPrice: 14.99,
    status: 'preparing',
    priority: 'medium',
    timestamp: new Date(2026, 3, 10, 14, 15),
  },
];

export const mockIngredients = [
  { id: '1', name: 'Chicken Breast', quantity: 25, unit: 'kg' },
];

export const mockAnalyticsData = [
  { date: 'Mon', orders: 18, earnings: 542 },
];
