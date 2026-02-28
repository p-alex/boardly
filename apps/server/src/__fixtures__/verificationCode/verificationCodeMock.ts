import { EmailVerificationCode } from "../../../generated/prisma_client/client.js";

export const verificationCodeMock: EmailVerificationCode = {
  id: "id",
  user_id: "user_id",
  code_hash: "code_hash",
  can_resend_at: new Date(),
  resend_code_count: 0,
  last_attempt_at: null,
  attempts: 0,
  expires_at: new Date(),
  lock_until: null,
};
