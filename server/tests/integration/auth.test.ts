import request from "supertest";
import { setupTestDB, teardownTestDB, clearDatabase } from "../setup";
import app from "../../src/app";

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

afterEach(async () => {
  await clearDatabase();
});

describe("POST /api/auth/register", () => {
  const validUser = {
    name: "Test User",
    email: "test@example.com",
    password: "Password123!",
  };

  it("creates a user and returns 201 with user and token", async () => {
    const res = await request(app).post("/api/auth/register").send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toMatchObject({
      name: "Test User",
      email: "test@example.com",
      role: "customer",
    });
    expect(res.body.data.user.id).toBeDefined();
    expect(res.body.data.token).toBeDefined();
    expect(typeof res.body.data.token).toBe("string");
    // Password should never be in response
    expect(res.body.data.user.password).toBeUndefined();
  });

  it("returns 400 for missing required fields", async () => {
    const res = await request(app).post("/api/auth/register").send({ name: "Test" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 for invalid email format", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validUser, email: "not-an-email" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 409 for duplicate email", async () => {
    await request(app).post("/api/auth/register").send(validUser);

    const res = await request(app).post("/api/auth/register").send(validUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("EMAIL_TAKEN");
  });

  it("rejects unknown fields like role (strict schema)", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validUser, role: "admin" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("lowercases email before saving", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validUser, email: "Test@Example.COM" });

    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe("test@example.com");
  });
});

describe("POST /api/auth/login", () => {
  const validUser = {
    name: "Test User",
    email: "test@example.com",
    password: "Password123!",
  };

  beforeEach(async () => {
    await request(app).post("/api/auth/register").send(validUser);
  });

  it("returns 200 with user and token for valid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toMatchObject({
      name: "Test User",
      email: "test@example.com",
      role: "customer",
    });
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.password).toBeUndefined();
  });

  it("returns 401 for wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: validUser.email, password: "WrongPassword123!" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("returns 401 for non-existent email (same message as wrong password)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "Password123!" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("returns 400 for missing fields", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: validUser.email });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});
