import { VerificationCode } from "./index.js";

export class VerificationCodeRateLimiter {
  private readonly softLockThreshold: number;
  private readonly lockDuration: number;

  constructor() {
    this.softLockThreshold = 5;
    this.lockDuration = 1000 * 60 * 10;
  }

  limit = (
    code: VerificationCode,
    lockThreshold: number = this.softLockThreshold,
    lockDuration: number = this.lockDuration,
  ) => {
    let lock_until: Date | undefined;

    if (code.attempts >= lockThreshold) {
      lock_until = new Date(Date.now() + lockDuration);
    }

    return { lock_until };
  };
}

const verificationCodeRateLimiter = new VerificationCodeRateLimiter();

export default verificationCodeRateLimiter;
