import request from "supertest";
import mongoose from "mongoose";
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

afterEach(async () => {
  const vehiclesCollection = mongoose.connection.collections["vehicles"];
  if (vehiclesCollection) {
    await vehiclesCollection.deleteMany({});
  }
});

describe("GET /api/vehicles/search", () => {
  beforeEach(async () => {
    await Vehicle.create([
      { make: "Toyota", model: "Camry", category: "Sedan", price: 25000, quantity: 5 },
      { make: "Toyota", model: "RAV4", category: "SUV", price: 32000, quantity: 3 },
      { make: "Honda", model: "Civic", category: "Sedan", price: 22000, quantity: 8 },
      { make: "Ford", model: "F-150", category: "Truck", price: 45000, quantity: 2 },
      { make: "BMW", model: "3 Series", category: "Sedan", price: 42000, quantity: 1 },
    ]);
  });

  it("filters by make (case-insensitive partial match)", async () => {
    const res = await request(app)
      .get("/api/vehicles/search?make=toy")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.vehicles).toHaveLength(2);
    expect(res.body.data.vehicles.every((v: { make: string }) => /toyota/i.test(v.make))).toBe(
      true,
    );
  });

  it("filters by model (case-insensitive partial match)", async () => {
    const res = await request(app)
      .get("/api/vehicles/search?model=cam")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.vehicles).toHaveLength(1);
    expect(res.body.data.vehicles[0].model).toBe("Camry");
  });

  it("filters by category (exact match)", async () => {
    const res = await request(app)
      .get("/api/vehicles/search?category=Sedan")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.vehicles).toHaveLength(3);
  });

  it("filters by minPrice and maxPrice (inclusive)", async () => {
    const res = await request(app)
      .get("/api/vehicles/search?minPrice=25000&maxPrice=42000")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    // 25000 (Camry), 32000 (RAV4), 42000 (BMW) - inclusive on both ends
    expect(res.body.data.vehicles).toHaveLength(3);
  });

  it("combines filters with AND logic", async () => {
    const res = await request(app)
      .get("/api/vehicles/search?make=toyota&category=SUV")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.vehicles).toHaveLength(1);
    expect(res.body.data.vehicles[0].model).toBe("RAV4");
  });

  it("returns paginated results", async () => {
    const res = await request(app)
      .get("/api/vehicles/search?page=1&limit=2")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.vehicles).toHaveLength(2);
    expect(res.body.pagination).toMatchObject({
      page: 1,
      limit: 2,
      total: 5,
      totalPages: 3,
    });
  });

  it("returns empty array when no match", async () => {
    const res = await request(app)
      .get("/api/vehicles/search?make=Porsche")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.vehicles).toHaveLength(0);
    expect(res.body.pagination.total).toBe(0);
  });

  it("returns all vehicles when no filters are provided", async () => {
    const res = await request(app)
      .get("/api/vehicles/search")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.vehicles).toHaveLength(5);
  });
});

describe("POST /api/vehicles/:id/purchase", () => {
  it("decrements stock by default quantity of 1", async () => {
    const vehicle = await Vehicle.create({
      make: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 5,
    });

    const res = await request(app)
      .post(`/api/vehicles/${vehicle._id}/purchase`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.vehicle.quantity).toBe(4);
  });

  it("decrements stock by specified quantity", async () => {
    const vehicle = await Vehicle.create({
      make: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 10,
    });

    const res = await request(app)
      .post(`/api/vehicles/${vehicle._id}/purchase`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ quantity: 3 });

    expect(res.status).toBe(200);
    expect(res.body.data.vehicle.quantity).toBe(7);
  });

  it("returns 409 and leaves stock unchanged when purchase exceeds available stock", async () => {
    const vehicle = await Vehicle.create({
      make: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 2,
    });

    const res = await request(app)
      .post(`/api/vehicles/${vehicle._id}/purchase`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ quantity: 5 });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("INSUFFICIENT_STOCK");

    // Verify stock is unchanged
    const unchanged = await Vehicle.findById(vehicle._id);
    expect(unchanged!.quantity).toBe(2);
  });

  it("returns 404 for non-existent vehicle", async () => {
    const fakeId = "507f1f77bcf86cd799439011";
    const res = await request(app)
      .post(`/api/vehicles/${fakeId}/purchase`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ quantity: 1 });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("returns 409 when trying to purchase from zero-stock vehicle", async () => {
    const vehicle = await Vehicle.create({
      make: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 0,
    });

    const res = await request(app)
      .post(`/api/vehicles/${vehicle._id}/purchase`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({});

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("INSUFFICIENT_STOCK");
  });
});

describe("POST /api/vehicles/:id/restock", () => {
  it("increments stock (admin only)", async () => {
    const vehicle = await Vehicle.create({
      make: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 5,
    });

    const res = await request(app)
      .post(`/api/vehicles/${vehicle._id}/restock`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ quantity: 10 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.vehicle.quantity).toBe(15);
  });

  it("returns 403 for non-admin user", async () => {
    const vehicle = await Vehicle.create({
      make: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 5,
    });

    const res = await request(app)
      .post(`/api/vehicles/${vehicle._id}/restock`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ quantity: 10 });

    expect(res.status).toBe(403);
  });

  it("returns 400 for missing quantity", async () => {
    const vehicle = await Vehicle.create({
      make: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 5,
    });

    const res = await request(app)
      .post(`/api/vehicles/${vehicle._id}/restock`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 for zero/negative quantity", async () => {
    const vehicle = await Vehicle.create({
      make: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 5,
    });

    const res = await request(app)
      .post(`/api/vehicles/${vehicle._id}/restock`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ quantity: 0 });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 404 for non-existent vehicle", async () => {
    const fakeId = "507f1f77bcf86cd799439011";
    const res = await request(app)
      .post(`/api/vehicles/${fakeId}/restock`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ quantity: 5 });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});
