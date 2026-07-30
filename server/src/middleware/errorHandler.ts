import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.code,
      },
    });
    return;
  }

  // Mongoose CastError (e.g., invalid ObjectId)
  if (err.name === "CastError") {
    res.status(400).json({
      success: false,
      error: { message: "Invalid ID format", code: "BAD_REQUEST" },
    });
    return;
  }

  // Mongoose ValidationError — don't leak schema details
  if (err.name === "ValidationError") {
    res.status(400).json({
      success: false,
      error: { message: "Validation failed", code: "VALIDATION_ERROR" },
    });
    return;
  }

  // MongoDB duplicate key error
  if ("code" in err && (err as { code: number }).code === 11000) {
    res.status(409).json({
      success: false,
      error: { message: "Duplicate entry", code: "CONFLICT" },
    });
    return;
  }

  console.error("Unhandled error:", err);

  res.status(500).json({
    success: false,
    error: {
      message: "Internal server error",
      code: "INTERNAL_ERROR",
    },
  });
}
