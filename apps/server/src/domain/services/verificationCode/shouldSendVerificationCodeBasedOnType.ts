import { User, VerificationCode } from "../../../../generated/prisma_client/client.js";

function shouldSendVerificationCodeBasedOnType(data: {
  code_type: VerificationCode["type"];
  user: User;
}) {
  const map: Record<VerificationCode["type"], boolean> = {
    EMAIL_VERIFICATION: data.user.email_verified === false,
  };

  return map[data.code_type];
}

export default shouldSendVerificationCodeBasedOnType;
