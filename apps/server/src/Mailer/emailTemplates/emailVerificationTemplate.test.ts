import { describe, expect, it } from "vitest";
import { emailVerificationTemplate } from "./index.js";

describe("emailVerificationTemplate.ts", () => {
  it("should embed verification code in text and html", () => {
    const code = "5000";
    const result = emailVerificationTemplate(code);

    expect(result.subject).toBe("Email verification");
    expect(result.text).toContain(code);
    expect(result.html).toContain(code);
  });
});
