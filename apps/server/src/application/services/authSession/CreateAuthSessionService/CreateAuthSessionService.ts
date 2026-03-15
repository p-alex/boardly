import authSessionFactory, {
  AuthSessionFactory,
} from "../../../../domain/factories/AuthSessionFactory.js";
import makeRefreshToken from "../../../../infrastructure/auth/makeRefreshToken.js";
import { prisma } from "../../../../prisma.js";
import { IService, PrismaTsx } from "../../index.js";

export class CreateAuthSessionService implements IService {
  constructor(
    private readonly _makeRefreshToken: typeof makeRefreshToken,
    private readonly _authSessionFactory: AuthSessionFactory,
  ) {}

  execute = async (tsx: PrismaTsx | null, data: { user_id: string }) => {
    const dbClient = tsx ?? prisma;

    const { token, refreshToken, sessionId } = this._makeRefreshToken();

    const newAuthSession = this._authSessionFactory.create({
      id: sessionId,
      token: token,
      user_id: data.user_id,
    });

    const createdAuthSession = await dbClient.authSession.create({ data: newAuthSession });

    return { refreshToken, authSession: createdAuthSession };
  };
}

const createAuthSessionService = new CreateAuthSessionService(makeRefreshToken, authSessionFactory);

export default createAuthSessionService;
