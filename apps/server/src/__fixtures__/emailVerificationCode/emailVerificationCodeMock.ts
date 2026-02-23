import { EmailVerificationCode } from "../../../generated/prisma_client/client.js";

export const emailVerificationCodeMock: EmailVerificationCode = {
  id: "id",
  user_id: "user_id",
  code_hash: "code_hash",
  last_attempt_at: null,
  attempts: 0,
  expires_at: new Date(),
  lock_until: null,
};
