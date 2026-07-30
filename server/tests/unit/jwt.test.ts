import { generateToken, verifyToken } from "../../src/utils/jwt";

describe("JWT utilities", () => {
  it("generateToken creates a valid JWT string", () => {
    const token = generateToken({ userId: "123", role: "customer" });
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);
  });

  it("verifyToken decodes a valid JWT", () => {
    const token = generateToken({ userId: "abc123", role: "admin" });
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe("abc123");
    expect(decoded.role).toBe("admin");
  });

  it("verifyToken throws for an invalid JWT", () => {
    expect(() => verifyToken("invalid.token.here")).toThrow();
  });

  it("verifyToken throws for a tampered JWT", () => {
    const token = generateToken({ userId: "123", role: "customer" });
    const tampered = token.slice(0, -5) + "XXXXX";
    expect(() => verifyToken(tampered)).toThrow();
  });
});
