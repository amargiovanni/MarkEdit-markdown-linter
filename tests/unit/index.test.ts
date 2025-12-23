import { describe, it, expect } from "vitest";
import { VERSION } from "../../src/index";

describe("markedit-linter", () => {
  it("exports VERSION constant", () => {
    expect(VERSION).toBe("1.0.0");
  });
});
