import Vehicle, { IVehicle } from "../models/Vehicle";
import { AppError } from "../middleware/errorHandler";
import {
  CreateVehicleInput,
  UpdateVehicleInput,
} from "../middleware/validate";
import { PaginationInfo } from "../types";

// Escape regex metacharacters to prevent ReDoS from user input
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

interface PaginatedVehicles {
  vehicles: IVehicle[];
  pagination: PaginationInfo;
}

export async function createVehicle(input: CreateVehicleInput): Promise<IVehicle> {
  const vehicle = await Vehicle.create(input);
  return vehicle;
}

export async function getVehicles(page: number, limit: number): Promise<PaginatedVehicles> {
  const skip = (page - 1) * limit;
  const [vehicles, total] = await Promise.all([
    Vehicle.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
    Vehicle.countDocuments(),
  ]);

  return {
    vehicles,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateVehicle(id: string, input: UpdateVehicleInput): Promise<IVehicle> {
  const vehicle = await Vehicle.findByIdAndUpdate(id, input, {
    returnDocument: "after",
    runValidators: true,
  });

  if (!vehicle) {
    throw new AppError("Vehicle not found", 404, "NOT_FOUND");
  }

  return vehicle;
}

export async function deleteVehicle(id: string): Promise<void> {
  const vehicle = await Vehicle.findByIdAndDelete(id);

  if (!vehicle) {
    throw new AppError("Vehicle not found", 404, "NOT_FOUND");
  }
}

export async function getVehicleById(id: string): Promise<IVehicle> {
  const vehicle = await Vehicle.findById(id);

  if (!vehicle) {
    throw new AppError("Vehicle not found", 404, "NOT_FOUND");
  }

  return vehicle;
}

interface SearchFilters {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export async function searchVehicles(
  filters: SearchFilters,
  page: number,
  limit: number,
): Promise<PaginatedVehicles> {
  const query: Record<string, unknown> = {};

  if (filters.make) {
    query.make = { $regex: escapeRegex(filters.make), $options: "i" };
  }
  if (filters.model) {
    query.model = { $regex: escapeRegex(filters.model), $options: "i" };
  }
  if (filters.category) {
    query.category = filters.category;
  }
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.price = {};
    if (filters.minPrice !== undefined) {
      (query.price as Record<string, number>).$gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      (query.price as Record<string, number>).$lte = filters.maxPrice;
    }
  }

  const skip = (page - 1) * limit;
  const [vehicles, total] = await Promise.all([
    Vehicle.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Vehicle.countDocuments(query),
  ]);

  return {
    vehicles,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function purchaseVehicle(id: string, quantity: number): Promise<IVehicle> {
  const vehicle = await Vehicle.findOneAndUpdate(
    { _id: id, quantity: { $gte: quantity } },
    { $inc: { quantity: -quantity } },
    { returnDocument: "after" },
  );

  if (!vehicle) {
    const exists = await Vehicle.exists({ _id: id });
    if (!exists) {
      throw new AppError("Vehicle not found", 404, "NOT_FOUND");
    }
    throw new AppError("Insufficient stock", 409, "INSUFFICIENT_STOCK");
  }

  return vehicle;
}

export async function restockVehicle(id: string, quantity: number): Promise<IVehicle> {
  const vehicle = await Vehicle.findByIdAndUpdate(
    id,
    { $inc: { quantity } },
    { returnDocument: "after" },
  );

  if (!vehicle) {
    throw new AppError("Vehicle not found", 404, "NOT_FOUND");
  }

  return vehicle;
}
