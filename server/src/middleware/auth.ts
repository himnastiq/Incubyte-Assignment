import { Response, NextFunction } from "express";
import { verifyToken } from "../utils";
import { AppError } from "./errorHandler";
import { AuthRequest } from "../types";

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next(new AppError("Authentication required", 401, "UNAUTHORIZED"));
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.user = { id: decoded.userId, role: decoded.role };
    next();
  } catch {
    next(new AppError("Authentication required", 401, "UNAUTHORIZED"));
  }
}

export function authorize(...roles: Array<"customer" | "admin">) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("Authentication required", 401, "UNAUTHORIZED"));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError("Insufficient permissions", 403, "FORBIDDEN"));
      return;
    }

    next();
  };
}
