import { API_BASE_URL } from '../../shared/config';

export const getMenu = async () => {
  const res = await fetch(`${API_BASE_URL}/menu`);
  if (!res.ok) throw new Error("Failed to fetch menu");
  return res.json();
};

export const getKitchenStatus = async () => {
  const res = await fetch(`${API_BASE_URL}/kitchen/status`);
  if (!res.ok) throw new Error("Failed to fetch kitchen status");
  return res.json();
};
