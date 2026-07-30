import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
}).strict();

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const createVehicleSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  category: z.string().min(1, "Category is required"),
  price: z.number().min(0, "Price cannot be negative"),
  quantity: z.number().int().min(0, "Quantity cannot be negative").default(0),
  year: z.number().int().optional(),
  vin: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().min(1).optional(),
});

export const updateVehicleSchema = z.object({
  make: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
  quantity: z.number().int().min(0).optional(),
  year: z.number().int().optional(),
  vin: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().min(1).optional(),
});

export const purchaseSchema = z.object({
  quantity: z.number().int().min(1, "Quantity must be at least 1").default(1),
});

export const restockSchema = z.object({
  quantity: z.number().int().min(1, "Quantity must be a positive integer"),
});

export const paginationSchema = z.object({
  page: z
    .string()
    .default("1")
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().int().min(1)),
  limit: z
    .string()
    .default("20")
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().int().min(1).max(100)),
});

export const searchSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  category: z.string().optional(),
  minPrice: z
    .string()
    .transform((v) => parseFloat(v))
    .pipe(z.number().min(0))
    .optional(),
  maxPrice: z
    .string()
    .transform((v) => parseFloat(v))
    .pipe(z.number().min(0))
    .optional(),
  page: z
    .string()
    .default("1")
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().int().min(1)),
  limit: z
    .string()
    .default("20")
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().int().min(1).max(100)),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type PurchaseInput = z.infer<typeof purchaseSchema>;
export type RestockInput = z.infer<typeof restockSchema>;
