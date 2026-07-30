import request from "supertest";
import { setupTestDB, teardownTestDB } from "../setup";
import app from "../../src/app";
import User from "../../src/models/User";
import Vehicle from "../../src/models/Vehicle";
import { generateToken } from "../../src/utils/jwt";

let adminToken: string;
let customerToken: string;

beforeAll(async () => {
  await setupTestDB();

  const admin = await User.create({
    name: "Admin",
    email: "admin@test.com",
    password: "AdminPass123!",
    role: "admin",
  });
  adminToken = generateToken({ userId: admin._id.toString(), role: "admin" });

  const customer = await User.create({
    name: "Customer",
    email: "customer@test.com",
    password: "CustomerPass123!",
    role: "customer",
  });
  customerToken = generateToken({ userId: customer._id.toString(), role: "customer" });
});

afterAll(async () => {
  await teardownTestDB();
});

describe("Atomic purchase (concurrency guard)", () => {
  it("prevents stock from going negative under concurrent purchases", async () => {
    const vehicle = await Vehicle.create({
      make: "Tesla",
      model: "Model 3",
      category: "Sedan",
      price: 45000,
      quantity: 3,
    });

    // Fire 5 concurrent purchase requests for 1 unit each (only 3 should succeed)
    const results = await Promise.all(
      Array.from({ length: 5 }, () =>
        request(app)
          .post(`/api/vehicles/${vehicle._id}/purchase`)
          .set("Authorization", `Bearer ${customerToken}`)
          .send({ quantity: 1 }),
      ),
    );

    const successes = results.filter((r) => r.status === 200);
    const conflicts = results.filter((r) => r.status === 409);

    expect(successes.length).toBe(3);
    expect(conflicts.length).toBe(2);

    // Verify final stock is exactly 0
    const final = await Vehicle.findById(vehicle._id);
    expect(final!.quantity).toBe(0);
  });

  it("prevents buying more than available in a single request", async () => {
    const vehicle = await Vehicle.create({
      make: "BMW",
      model: "X5",
      category: "SUV",
      price: 65000,
      quantity: 2,
    });

    const res = await request(app)
      .post(`/api/vehicles/${vehicle._id}/purchase`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ quantity: 3 });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("INSUFFICIENT_STOCK");

    // Stock unchanged
    const unchanged = await Vehicle.findById(vehicle._id);
    expect(unchanged!.quantity).toBe(2);
  });
});

describe("Auth middleware edge cases", () => {
  it("rejects expired token with 401", async () => {
    // Create a token with a very short expiry (already expired)
    const jwt = await import("jsonwebtoken");
    const expired = jwt.default.sign(
      { userId: "fake", role: "customer" },
      process.env.JWT_SECRET!,
      { expiresIn: "0s" },
    );

    const res = await request(app)
      .get("/api/vehicles")
      .set("Authorization", `Bearer ${expired}`);

    expect(res.status).toBe(401);
  });

  it("rejects malformed authorization header", async () => {
    const res = await request(app)
      .get("/api/vehicles")
      .set("Authorization", "NotBearer some-token");

    expect(res.status).toBe(401);
  });

  it("rejects empty bearer token", async () => {
    const res = await request(app)
      .get("/api/vehicles")
      .set("Authorization", "Bearer ");

    expect(res.status).toBe(401);
  });
});

describe("Error handling edge cases", () => {
  it("returns 400 for invalid MongoDB ObjectId in vehicle routes", async () => {
    const res = await request(app)
      .put("/api/vehicles/not-a-valid-id")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ price: 30000 });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("BAD_REQUEST");
  });
});
