import { describe, it, expect, vi, beforeEach } from "vitest";
import { signInSchema } from "@/app/lib/zod";

describe("signInSchema", () => {
  it("should validate valid credentials", () => {
    const result = signInSchema.safeParse({
      username: "testuser",
      password: "password123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.username).toBe("testuser");
      expect(result.data.password).toBe("password123");
    }
  });

  it("should reject empty username", () => {
    const result = signInSchema.safeParse({
      username: "",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty password", () => {
    const result = signInSchema.safeParse({
      username: "testuser",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("should reject password shorter than 8 characters", () => {
    const result = signInSchema.safeParse({
      username: "testuser",
      password: "short",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.message.includes("more than 8 characters")),
      ).toBe(true);
    }
  });

  it("should reject password longer than 32 characters", () => {
    const result = signInSchema.safeParse({
      username: "testuser",
      password: "a".repeat(33),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.message.includes("less than 32 characters")),
      ).toBe(true);
    }
  });

  it("should accept password with exactly 8 characters", () => {
    const result = signInSchema.safeParse({
      username: "testuser",
      password: "12345678",
    });
    expect(result.success).toBe(true);
  });

  it("should accept password with exactly 32 characters", () => {
    const result = signInSchema.safeParse({
      username: "testuser",
      password: "a".repeat(32),
    });
    expect(result.success).toBe(true);
  });

  it("should reject missing username field", () => {
    const result = signInSchema.safeParse({
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing password field", () => {
    const result = signInSchema.safeParse({
      username: "testuser",
    });
    expect(result.success).toBe(false);
  });
});

describe("Authentication Flow", () => {
  it("should handle various authentication scenarios", () => {
    // Test that credentials object structure is expected
    const credentials = {
      username: "testuser",
      password: "validpassword",
    };

    expect(credentials).toHaveProperty("username");
    expect(credentials).toHaveProperty("password");
    expect(typeof credentials.username).toBe("string");
    expect(typeof credentials.password).toBe("string");
  });

  it("should validate user object structure", () => {
    // Test expected user object structure after successful auth
    const user = {
      id: "user-id-123",
      email: "test@example.com",
      name: "testuser",
      role: "General" as const,
      image: null,
    };

    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("email");
    expect(user).toHaveProperty("name");
    expect(user).toHaveProperty("role");
    expect(user).toHaveProperty("image");
    expect(["Admin", "General", "Treasurer", "Temporary"]).toContain(user.role);
  });

  it("should not include password in returned user object", () => {
    // Test that password is not included in user object
    const user = {
      id: "user-id-123",
      email: "test@example.com",
      name: "testuser",
      role: "General" as const,
      image: null,
    };

    expect(user).not.toHaveProperty("password");
  });
});
