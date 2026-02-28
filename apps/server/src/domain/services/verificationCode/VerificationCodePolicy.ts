import ValidationException from "../../../exceptions/ValidationException.js";
import { VerificationCode } from "./index.js";

export class VerificationCodePolicy {
  validateExistenceAndStatus = (code: VerificationCode | null) => {
    if (!code) throw new ValidationException("Invalid or expired code");

    const now = Date.now();

    if (code.lock_until && now <= code.lock_until.getTime())
      throw new ValidationException("Too many failed attempts. Wait before retrying this code");

    if (now >= code.expires_at.getTime()) throw new ValidationException("Invalid or expired code");
  };
}

const verificationCodePolicy = new VerificationCodePolicy();

export default verificationCodePolicy;
