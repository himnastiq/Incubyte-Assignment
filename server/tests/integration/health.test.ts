import request from "supertest";
import { setupTestDB, teardownTestDB } from "../setup";
import app from "../../src/app";

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

describe("GET /api/health", () => {
  it("returns 200 with success envelope", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      data: { status: "ok" },
    });
  });
});
