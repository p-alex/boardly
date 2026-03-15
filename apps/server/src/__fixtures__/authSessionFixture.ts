import { AuthSession } from "../../generated/prisma_client/client.js";

export const authSessionFixture: AuthSession = {
  id: "id",
  user_id: "user_id",
  token_hash: "token_hash",
  is_revoked: false,
  created_at: new Date(1000),
  expires_at: new Date(2000),
  token_family: "token_familiy",
};
