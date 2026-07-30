import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { env } from "../src/config";
import User from "../src/models/User";

async function seedAdmin(): Promise<void> {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required");
    process.exit(1);
  }

  await mongoose.connect(env.MONGODB_URI);
  console.info("Connected to MongoDB");

  const existingAdmin = await User.findOne({ email: env.ADMIN_EMAIL.toLowerCase() });

  if (existingAdmin) {
    console.info(`Admin user with email ${env.ADMIN_EMAIL} already exists. Skipping.`);
  } else {
    await User.create({
      name: "Admin",
      email: env.ADMIN_EMAIL,
      password: env.ADMIN_PASSWORD,
      role: "admin",
    });
    console.info(`Admin user created with email: ${env.ADMIN_EMAIL}`);
  }

  await mongoose.disconnect();
  console.info("Done.");
}

seedAdmin().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
