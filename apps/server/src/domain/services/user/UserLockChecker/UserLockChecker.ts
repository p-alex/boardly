import { User } from "../../../../../generated/prisma_client/client.js";

export class UserLockChecker {
  private readonly _hardLockDuration: number;

  constructor() {
    this._hardLockDuration = 1000 * 60 * 60 * 24;
  }

  isLocked = (user: User) => {
    if (!user.hard_lock_until) return false;

    return Date.now() <= user.hard_lock_until.getTime();
  };

  getHardLockDate = () => {
    return new Date(Date.now() + this._hardLockDuration);
  };
}

const userLockChecker = new UserLockChecker();

export default userLockChecker;
