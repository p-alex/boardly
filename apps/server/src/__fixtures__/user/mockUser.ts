import { User } from "../../../generated/prisma_client/client.js";

export const mockUser: User = {
  id: "id",
  username: "username",
  hashed_email: "hashed_email",
  created_at: new Date(2025, 0, 1, 0, 0),
  updated_at: new Date(2025, 0, 1, 0, 0),
  email_encryption_secret_version: "V1",
  email_hash_secret_version: "V1",
  email_verified: false,
  encrypted_email: "encrypted_email",
  hard_lock_until: null,
};
