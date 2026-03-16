import { PrismaClient } from "../../../../../generated/prisma_client/client.js";
import UnauthorizedException from "../../../../exceptions/UnauthorizedException.js";
import { AuthUser } from "../../../../interfaces/adapters/index.js";
import { prisma } from "../../../../prisma.js";
import { IUsecase } from "../../index.js";

export class LogoutUsecase implements IUsecase {
  constructor(private readonly _prisma: PrismaClient) {}

  execute = async (data: { authUser: AuthUser | null }) => {
    if (!data.authUser) throw new UnauthorizedException("Must be logged in");

    return await this._prisma.authSession.update({
      data: { is_revoked: true },
      where: { id: data.authUser.sessionId, user_id: data.authUser.id },
    });
  };
}

const logoutUsecase = new LogoutUsecase(prisma);

export default logoutUsecase;
