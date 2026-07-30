import request from "supertest";
import mongoose from "mongoose";
import { setupTestDB, teardownTestDB } from "../setup";
import app from "../../src/app";
import User from "../../src/models/User";
import { generateToken } from "../../src/utils/jwt";

let adminToken: string;
let customerToken: string;

beforeAll(async () => {
  await setupTestDB();

  // Create admin user directly in DB (password hashed by pre-save hook)
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
  // Clear vehicles between tests but keep users
  const vehiclesCollection = mongoose.connection.collections["vehicles"];
  if (vehiclesCollection) {
    await vehiclesCollection.deleteMany({});
  }
});

const validVehicle = {
  make: "Toyota",
  model: "Camry",
  category: "Sedan",
  price: 25000,
  quantity: 10,
};

describe("POST /api/vehicles", () => {
  it("creates a vehicle when admin, returns 201", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(validVehicle);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.vehicle).toMatchObject({
      make: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 10,
    });
    expect(res.body.data.vehicle._id).toBeDefined();
  });

  it("returns 403 for non-admin user", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${customerToken}`)
      .send(validVehicle);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("returns 401 for unauthenticated request", async () => {
    const res = await request(app).post("/api/vehicles").send(validVehicle);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 for invalid data (missing required fields)", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ make: "Toyota" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 for negative price", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ ...validVehicle, price: -1000 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("GET /api/vehicles", () => {
  it("returns paginated vehicle list for authenticated user", async () => {
    // Create a vehicle first
    await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(validVehicle);

    const res = await request(app)
      .get("/api/vehicles")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.vehicles).toHaveLength(1);
    expect(res.body.pagination).toMatchObject({
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    });
  });

  it("returns 401 for unauthenticated request", async () => {
    const res = await request(app).get("/api/vehicles");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("supports pagination query params", async () => {
    // Create multiple vehicles
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post("/api/vehicles")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ ...validVehicle, make: `Brand${i}` });
    }

    const res = await request(app)
      .get("/api/vehicles?page=2&limit=2")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.vehicles).toHaveLength(2);
    expect(res.body.pagination).toMatchObject({
      page: 2,
      limit: 2,
      total: 5,
      totalPages: 3,
    });
  });
});

describe("PUT /api/vehicles/:id", () => {
  it("updates a vehicle when admin, returns 200", async () => {
    const createRes = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(validVehicle);

    const vehicleId = createRes.body.data.vehicle._id;

    const res = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ price: 30000 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.vehicle.price).toBe(30000);
    expect(res.body.data.vehicle.make).toBe("Toyota"); // unchanged field preserved
  });

  it("returns 403 for non-admin user", async () => {
    const createRes = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(validVehicle);

    const vehicleId = createRes.body.data.vehicle._id;

    const res = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ price: 30000 });

    expect(res.status).toBe(403);
  });

  it("returns 404 for non-existent vehicle", async () => {
    const fakeId = "507f1f77bcf86cd799439011";
    const res = await request(app)
      .put(`/api/vehicles/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ price: 30000 });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe("DELETE /api/vehicles/:id", () => {
  it("deletes a vehicle when admin, returns 200", async () => {
    const createRes = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(validVehicle);

    const vehicleId = createRes.body.data.vehicle._id;

    const res = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBe("Vehicle deleted");
  });

  it("returns 403 for non-admin user", async () => {
    const createRes = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(validVehicle);

    const vehicleId = createRes.body.data.vehicle._id;

    const res = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
  });

  it("returns 404 for non-existent vehicle", async () => {
    const fakeId = "507f1f77bcf86cd799439011";
    const res = await request(app)
      .delete(`/api/vehicles/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
