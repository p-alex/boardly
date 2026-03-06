import { VerificationCode } from "../../../generated/prisma_client/client";
import { VerificationCodeTypeMapper } from "./VerificationCodeMapper";

describe("VerificationCodeMapper.ts", () => {
  const verificationCodeMapper = new VerificationCodeTypeMapper();

  it("maps email verification code type correctly", () => {
    expect(verificationCodeMapper.map("EMAIL_VERIFICATION")).toBe(
      "EMAIL_VERIFICATION" as VerificationCode["type"],
    );
  });
});
