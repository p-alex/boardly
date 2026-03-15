import { AuthSession } from "../../generated/prisma_client/client.js";

class AuthSessionBuilder {
  private readonly _authSession: AuthSession = {
    id: "id",
    user_id: "user_id",
    token_hash: "token_hash",
    token_family: "token_family",
    is_revoked: false,
    created_at: new Date(1000),
    expires_at: new Date(2000),
  };

  withRevoked = () => {
    this._authSession.is_revoked = true;
    return this;
  };

  build = (): AuthSession => {
    return this._authSession;
  };
}

export default AuthSessionBuilder;
