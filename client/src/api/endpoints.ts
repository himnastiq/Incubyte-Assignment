import api from "./client";
import type {
  AuthResponse,
  Vehicle,
  PaginationInfo,
  SearchFilters,
} from "../types";

// Auth endpoints
export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await api.post("/api/auth/register", data);
  return res.data.data;
}

export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await api.post("/api/auth/login", data);
  return res.data.data;
}

// Vehicle endpoints
export async function getVehicles(
  page = 1,
  limit = 20,
): Promise<{ vehicles: Vehicle[]; pagination: PaginationInfo }> {
  const res = await api.get("/api/vehicles", { params: { page, limit } });
  return { vehicles: res.data.data.vehicles, pagination: res.data.pagination };
}

export async function searchVehicles(
  filters: SearchFilters,
): Promise<{ vehicles: Vehicle[]; pagination: PaginationInfo }> {
  const params: Record<string, string | number> = {};
  if (filters.make) params.make = filters.make;
  if (filters.model) params.model = filters.model;
  if (filters.category) params.category = filters.category;
  if (filters.minPrice) params.minPrice = filters.minPrice;
  if (filters.maxPrice) params.maxPrice = filters.maxPrice;
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;

  const res = await api.get("/api/vehicles/search", { params });
  return { vehicles: res.data.data.vehicles, pagination: res.data.pagination };
}

export async function createVehicle(
  data: Partial<Vehicle>,
): Promise<Vehicle> {
  const res = await api.post("/api/vehicles", data);
  return res.data.data.vehicle;
}

export async function updateVehicle(
  id: string,
  data: Partial<Vehicle>,
): Promise<Vehicle> {
  const res = await api.put(`/api/vehicles/${id}`, data);
  return res.data.data.vehicle;
}

export async function deleteVehicle(id: string): Promise<void> {
  await api.delete(`/api/vehicles/${id}`);
}

export async function purchaseVehicle(
  id: string,
  quantity = 1,
): Promise<Vehicle> {
  const res = await api.post(`/api/vehicles/${id}/purchase`, { quantity });
  return res.data.data.vehicle;
}

export async function restockVehicle(
  id: string,
  quantity: number,
): Promise<Vehicle> {
  const res = await api.post(`/api/vehicles/${id}/restock`, { quantity });
  return res.data.data.vehicle;
}
