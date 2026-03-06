import { describe, it, expect } from "vitest";
import shouldSendVerificationCodeBasedOnType from "./shouldSendVerificationCodeBasedOnType.js";
import { User } from "../../../../generated/prisma_client/client.js";

describe("shouldSendVerificationCodeBasedOnType", () => {
  const user = { email_verified: false } as Pick<User, "email_verified"> as User;

  it("returns true when email is not verified", () => {
    const result = shouldSendVerificationCodeBasedOnType({
      code_type: "EMAIL_VERIFICATION",
      user: user as any,
    });

    expect(result).toBe(true);
  });

  it("returns false when email is already verified", () => {
    const result = shouldSendVerificationCodeBasedOnType({
      code_type: "EMAIL_VERIFICATION",
      user: { ...user, email_verified: true } as any,
    });

    expect(result).toBe(false);
  });
});
