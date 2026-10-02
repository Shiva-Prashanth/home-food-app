import { API_BASE_URL as BASE_URL } from '../../shared/config';

export async function getOrders() {
  const response = await fetch(`${BASE_URL}/orders`);
  if (!response.ok) throw new Error("Failed to fetch orders");
  return response.json();
}

export async function updateOrderStatus(orderId, newStatus) {
  const response = await fetch(`${BASE_URL}/order/${orderId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus })
  });
  if (!response.ok) throw new Error("Failed to update status");
  return response.json();
}

// --- Menu API ---

export async function getMenu() {
  const response = await fetch(`${BASE_URL}/menu`);
  if (!response.ok) throw new Error("Failed to fetch menu");
  return response.json();
}

export async function addMenuItem(itemData) {
  const response = await fetch(`${BASE_URL}/menu`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itemData)
  });
  if (!response.ok) throw new Error("Failed to add menu item");
  return response.json();
}

export async function updateMenuItem(itemId, updates) {
  const response = await fetch(`${BASE_URL}/menu/${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!response.ok) throw new Error("Failed to update menu item");
  return response.json();
}

export async function deleteMenuItem(itemId) {
  const response = await fetch(`${BASE_URL}/menu/${itemId}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error("Failed to delete menu item");
  return response.json();
}

// --- Kitchen Status API ---

export async function getKitchenStatus() {
  const response = await fetch(`${BASE_URL}/kitchen/status`);
  if (!response.ok) throw new Error("Failed to fetch kitchen status");
  return response.json();
}

export async function updateKitchenStatus(status) {
  const response = await fetch(`${BASE_URL}/kitchen/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error("Failed to update kitchen status");
  return response.json();
}

// --- Ingredients API ---

export async function getIngredients() {
  const response = await fetch(`${BASE_URL}/ingredients`);
  if (!response.ok) throw new Error("Failed to fetch ingredients");
  return response.json();
}

export async function addIngredient(data) {
  const response = await fetch(`${BASE_URL}/ingredients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error("Failed to add ingredient");
  return response.json();
}

export async function updateIngredient(id, data) {
  const response = await fetch(`${BASE_URL}/ingredients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error("Failed to update ingredient");
  return response.json();
}

export async function deleteIngredient(id) {
  const response = await fetch(`${BASE_URL}/ingredients/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error("Failed to delete ingredient");
  return response.json();
}

export async function getIngredientUsage() {
  const response = await fetch(`${BASE_URL}/ingredients/usage/today`);
  if (!response.ok) throw new Error("Failed to fetch ingredient usage");
  return response.json();
}

// --- Analytics APIs ---

export async function getAnalyticsSummary() {
  const res = await fetch(`${BASE_URL}/analytics/summary`);
  if (!res.ok) throw new Error("Failed to fetch summary");
  return res.json();
}

export async function getAnalyticsTopItems() {
  const res = await fetch(`${BASE_URL}/analytics/top-items`);
  if (!res.ok) throw new Error("Failed to fetch top items");
  return res.json();
}

export async function getAnalyticsUsage() {
  const res = await fetch(`${BASE_URL}/analytics/ingredient-usage`);
  if (!res.ok) throw new Error("Failed to fetch analytics usage");
  return res.json();
}

export async function getAnalyticsStatus() {
  const res = await fetch(`${BASE_URL}/analytics/order-status`);
  if (!res.ok) throw new Error("Failed to fetch status");
  return res.json();
}

export async function getAnalyticsPeakTime() {
  const res = await fetch(`${BASE_URL}/analytics/peak-time`);
  if (!res.ok) throw new Error("Failed to fetch peak time");
  return res.json();
}

export async function getAnalyticsLowStock() {
  const res = await fetch(`${BASE_URL}/analytics/low-stock`);
  if (!res.ok) throw new Error("Failed to fetch low stock");
  return res.json();
}
