import { UserPasswordAuth } from "../../../generated/prisma_client/client.js";

export const mockUserPasswordAuthMock: UserPasswordAuth = {
  user_id: "user_id",
  password_hash: "password_hashh",
  password_pepper_version: "V1",
  created_at: new Date(2000, 10, 10),
  updated_at: new Date(2000, 10, 10),
};
