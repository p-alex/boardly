import { User } from "../../generated/prisma_client/client.js";

export class UserBuilder {
  private readonly _user: User = {
    id: "id",
    username: "username",
    created_at: new Date(1000),
    email_encryption_secret_version: "V1",
    email_hash_secret_version: "V1",
    email_verified: true,
    encrypted_email: "encrypted_email",
    hard_lock_until: new Date(2000),
    hashed_email: "hashed_email",
    updated_at: new Date(1000),
  };

  withUnverifiedEmail() {
    this._user.email_verified = false;
    return this;
  }

  withLockedAccount(date: Date) {
    this._user.hard_lock_until = date;
    return this;
  }

  build() {
    return this._user;
  }
}
