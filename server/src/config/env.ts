import dotenv from "dotenv";

dotenv.config();

function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function loadEnv() {
  return Object.freeze({
    PORT: parseInt(getEnvVar("PORT", "3001"), 10),
    MONGODB_URI: getEnvVar("MONGODB_URI"),
    JWT_SECRET: getEnvVar("JWT_SECRET"),
    JWT_EXPIRES_IN: getEnvVar("JWT_EXPIRES_IN", "24h"),
    CLIENT_URL: getEnvVar("CLIENT_URL", "http://localhost:5173"),
    ADMIN_EMAIL: getEnvVar("ADMIN_EMAIL", ""),
    ADMIN_PASSWORD: getEnvVar("ADMIN_PASSWORD", ""),
    NODE_ENV: getEnvVar("NODE_ENV", "development"),
  });
}

// Parsed once at module load; frozen to prevent accidental mutation
export const env = loadEnv();
