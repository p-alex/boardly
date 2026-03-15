import { PrismaClient } from "../../../../../generated/prisma_client/client.js";
import { prisma } from "../../../../prisma.js";
import { IUsecase } from "../../index.js";
import ForbiddenException from "../../../../exceptions/ForbiddenException.js";
import { clock, Clock, CryptoUtil, cryptoUtil } from "@boardly/shared/utils";
import { env } from "../../../../config.js";
import timingSafeEqual from "../../../../timingSafeEqual.js";
import makeRefreshToken from "../../../../infrastructure/auth/makeRefreshToken.js";
import makeAccessToken from "../../../../infrastructure/auth/makeAccessToken.js";

export class RefreshSessionUsecase implements IUsecase {
  constructor(
    private readonly _prisma: PrismaClient,
    private readonly _timingSafeEqual: typeof timingSafeEqual,
    private readonly _cryptoUtil: CryptoUtil,
    private readonly _makeAccessToken: typeof makeAccessToken,
    private readonly _makeRefreshToken: typeof makeRefreshToken,
    private readonly _clock: Clock,
  ) {}

  execute = async (data: { refreshToken: string }) => {
    return await this._prisma.$transaction(async (tsx) => {
      const parts = data.refreshToken.split(".");

      if (parts.length !== 2) throw new ForbiddenException("Invalid or expired session");

      const [sessionId, token] = parts;

      const authSession = await tsx.authSession.findUnique({ where: { id: sessionId } });

      if (!authSession) throw new ForbiddenException("Invalid or expired session");

      if (authSession.is_revoked) throw new ForbiddenException("Invalid or expired session");

      if (authSession.expires_at.getTime() <= this._clock.now()) {
        await tsx.authSession.update({ data: { is_revoked: true }, where: { id: authSession.id } });
        throw new ForbiddenException("Invalid or expired session");
      }

      const isValidToken = this._timingSafeEqual(
        this._cryptoUtil.hmacSHA256(token, env.HASH_SECRETS.SESSION_TOKEN),
        authSession.token_hash,
      );

      if (!isValidToken) {
        await tsx.authSession.updateMany({
          data: { is_revoked: true },
          where: { token_family: authSession.token_family },
        });
        throw new ForbiddenException("Invalid or expired session");
      }

      const user = await tsx.user.findUnique({ where: { id: authSession.user_id } });

      if (!user) throw new ForbiddenException("Invalid or expired session");

      const newRefreshToken = this._makeRefreshToken(authSession.id);

      const newAccessToken = this._makeAccessToken({ id: authSession.user_id });

      const refreshResult = await tsx.authSession.updateMany({
        data: {
          token_hash: this._cryptoUtil.hmacSHA256(
            newRefreshToken.token,
            env.HASH_SECRETS.SESSION_TOKEN,
          ),
        },
        where: { id: authSession.id, token_hash: authSession.token_hash },
      });

      if (refreshResult.count === 0) throw new ForbiddenException("Invalid or expired session");

      return {
        refreshToken: newRefreshToken.refreshToken,
        accessToken: newAccessToken,
        refreshTokenExpiryMs: authSession.expires_at.getTime() - this._clock.now(),
        user,
      };
    });
  };
}

const refreshSessionUsecase = new RefreshSessionUsecase(
  prisma,
  timingSafeEqual,
  cryptoUtil,
  makeAccessToken,
  makeRefreshToken,
  clock,
);

export default refreshSessionUsecase;
