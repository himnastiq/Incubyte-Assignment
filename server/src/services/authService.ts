import User from "../models/User";
import { generateToken } from "../utils";
import { AppError } from "../middleware/errorHandler";
import { AuthResponse } from "../types";
import { RegisterInput, LoginInput } from "../middleware/validate";

export async function registerUser(input: RegisterInput): Promise<AuthResponse> {
  const existingUser = await User.findOne({ email: input.email.toLowerCase() });
  if (existingUser) {
    throw new AppError("An account with this email already exists", 409, "EMAIL_TAKEN");
  }

  const user = await User.create({
    name: input.name,
    email: input.email,
    password: input.password,
    role: "customer",
  });

  const token = generateToken({ userId: user._id.toString(), role: user.role });

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
}

export async function loginUser(input: LoginInput): Promise<AuthResponse> {
  const user = await User.findOne({ email: input.email.toLowerCase() }).select("+password");
  if (!user) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  const isMatch = await user.comparePassword(input.password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  const token = generateToken({ userId: user._id.toString(), role: user.role });

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
}
