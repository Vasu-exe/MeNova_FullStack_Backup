import { describe, expect, it } from "vitest";

describe("Admin password configuration", () => {
  it("MENOVA_ADMIN_PASSWORD environment variable is set", () => {
    const password = process.env.MENOVA_ADMIN_PASSWORD;
    expect(password).toBeDefined();
    expect(typeof password).toBe("string");
    expect(password!.length).toBeGreaterThan(0);
  });
});
