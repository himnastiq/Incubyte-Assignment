import { Request, Response, NextFunction } from "express";
import { registerSchema, loginSchema } from "../middleware/validate";
import { AppError } from "../middleware/errorHandler";
import * as authService from "../services/authService";
import { formatZodError } from "../utils";

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(formatZodError(parsed.error), 400, "VALIDATION_ERROR");
    }

    const result = await authService.registerUser(parsed.data);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(formatZodError(parsed.error), 400, "VALIDATION_ERROR");
    }

    const result = await authService.loginUser(parsed.data);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
