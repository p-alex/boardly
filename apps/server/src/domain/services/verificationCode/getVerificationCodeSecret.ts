import { VerificationCode } from "../../../../generated/prisma_client/client.js";
import { env } from "../../../config.js";

export function getVerificationCodeSecret(verificationCodeType: VerificationCode["type"]) {
  const codeTypeToSecret: Record<VerificationCode["type"], string> = {
    EMAIL_VERIFICATION: env.HASH_SECRETS.VERIFICATION_CODES.EMAIL_VERIFICATION,
  };

  return codeTypeToSecret[verificationCodeType];
}
