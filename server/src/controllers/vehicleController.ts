import { Request, Response, NextFunction } from "express";
import {
  createVehicleSchema,
  updateVehicleSchema,
  paginationSchema,
  searchSchema,
  purchaseSchema,
  restockSchema,
} from "../middleware/validate";
import { AppError } from "../middleware/errorHandler";
import * as vehicleService from "../services/vehicleService";
import { formatZodError } from "../utils";

export async function createVehicle(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = createVehicleSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(formatZodError(parsed.error), 400, "VALIDATION_ERROR");
    }

    const vehicle = await vehicleService.createVehicle(parsed.data);
    res.status(201).json({ success: true, data: { vehicle } });
  } catch (error) {
    next(error);
  }
}

export async function getVehicles(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = paginationSchema.safeParse(req.query);
    if (!parsed.success) {
      throw new AppError(formatZodError(parsed.error), 400, "VALIDATION_ERROR");
    }

    const result = await vehicleService.getVehicles(parsed.data.page, parsed.data.limit);
    res.json({
      success: true,
      data: { vehicles: result.vehicles },
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateVehicle(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = updateVehicleSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(formatZodError(parsed.error), 400, "VALIDATION_ERROR");
    }

    const vehicle = await vehicleService.updateVehicle(req.params.id as string, parsed.data);
    res.json({ success: true, data: { vehicle } });
  } catch (error) {
    next(error);
  }
}

export async function deleteVehicle(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await vehicleService.deleteVehicle(req.params.id as string);
    res.json({ success: true, data: { message: "Vehicle deleted" } });
  } catch (error) {
    next(error);
  }
}

export async function searchVehicles(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = searchSchema.safeParse(req.query);
    if (!parsed.success) {
      throw new AppError(formatZodError(parsed.error), 400, "VALIDATION_ERROR");
    }

    const { page, limit, ...filters } = parsed.data;
    const result = await vehicleService.searchVehicles(filters, page, limit);
    res.json({
      success: true,
      data: { vehicles: result.vehicles },
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function purchaseVehicle(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = purchaseSchema.safeParse(req.body || {});
    if (!parsed.success) {
      throw new AppError(formatZodError(parsed.error), 400, "VALIDATION_ERROR");
    }

    const vehicle = await vehicleService.purchaseVehicle(req.params.id as string, parsed.data.quantity);
    res.json({ success: true, data: { vehicle } });
  } catch (error) {
    next(error);
  }
}

export async function restockVehicle(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = restockSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(formatZodError(parsed.error), 400, "VALIDATION_ERROR");
    }

    const vehicle = await vehicleService.restockVehicle(req.params.id as string, parsed.data.quantity);
    res.json({ success: true, data: { vehicle } });
  } catch (error) {
    next(error);
  }
}
