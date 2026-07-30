import { Request } from "express";

export interface JwtPayload {
  userId: string;
  role: "customer" | "admin";
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: "customer" | "admin";
  };
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T;
  pagination: PaginationInfo;
}

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
  };
}
