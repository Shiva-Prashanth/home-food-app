const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const getMenu = async () => {
  const res = await fetch(`${BASE_URL}/menu`);
  if (!res.ok) throw new Error("Failed to fetch menu");
  return res.json();
};

export const getKitchenStatus = async () => {
  const res = await fetch(`${BASE_URL}/kitchen/status`);
  if (!res.ok) throw new Error("Failed to fetch kitchen status");
  return res.json();
};
