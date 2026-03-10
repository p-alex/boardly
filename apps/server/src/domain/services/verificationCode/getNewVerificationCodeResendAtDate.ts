import { verificationCodeConstants } from "@boardly/shared/constants";
import { VerificationCode } from "../../../../generated/prisma_client/client.js";

function getNewVerificationCodeResendAtDate(data: {
  resend_count: VerificationCode["resend_code_count"];
}) {
  return new Date(
    Date.now() +
      (verificationCodeConstants.BASE_CAN_RESEND_AFTER_MS + 1000 * 60 * 2 * data.resend_count),
  );
}

export default getNewVerificationCodeResendAtDate;
