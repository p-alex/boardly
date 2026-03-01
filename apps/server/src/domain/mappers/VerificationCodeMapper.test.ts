import { VerificationCodeType } from "../../application/services/verificationCode";
import { VerificationCodeMapper } from "./VerificationCodeMapper";

describe("VerificationCodeMapper.ts", () => {
  const verificationCodeMapper = new VerificationCodeMapper();

  it("maps email verification code type correctly", () => {
    expect(verificationCodeMapper.map("EMAIL_VERIFICATION")).toBe(
      "emailVerificationCode" as VerificationCodeType,
    );
  });
});
