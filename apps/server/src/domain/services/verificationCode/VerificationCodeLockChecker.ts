export class VerificationCodeLockChecker {
  constructor() {}

  getLockDuration = () => {
    return new Date(Date.now() + 1000 * 60 * 10);
  };
}

const verificationCodeLockerChecker = new VerificationCodeLockChecker();

export default verificationCodeLockerChecker;
