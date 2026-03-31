import { Mock, Mocked, vi } from "vitest";
import { PrismaClient } from "../../../../../generated/prisma_client/client";
import { RefreshSessionUsecase } from "./RefreshSessionUsecase";
import type { PrismaTsx } from "../../../services";
import { Clock, CryptoUtil } from "@boardly/shared/utils";
import ForbiddenException from "../../../../exceptions/ForbiddenException";
import { UserBuilder, AuthSessionBuilder } from "../../../../__testEntityBuilders__";

function createSut() {
  const authSession = new AuthSessionBuilder().build();

  const user = new UserBuilder().build();

  const prismaTsx = {
    // @ts-ignore
    authSession: {
      findUnique: vi.fn().mockResolvedValue(authSession),
      update: vi.fn().mockResolvedValue(authSession),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    // @ts-ignore
    user: {
      findUnique: vi.fn().mockResolvedValue(user),
    },
  } as unknown as Mocked<PrismaTsx>;

  const prismaClient = {
    $transaction: vi.fn((cb) => cb(prismaTsx)),
  } as unknown as Mocked<PrismaClient>;

  const timingSafeEqual = vi.fn().mockReturnValue(true);

  const cryptoUtil = {
    hmacSHA256: vi.fn().mockReturnValue(authSession.token_hash),
  } as unknown as Mocked<CryptoUtil>;

  const makeAccessToken = vi.fn().mockReturnValue("accessToken");

  const makeRefreshToken = vi.fn().mockReturnValue("refreshToken");

  const clock = {
    now: vi.fn().mockReturnValue(1000),
  } as unknown as Mocked<Clock>;

  const refreshSessionUsecase = new RefreshSessionUsecase(
    prismaClient,
    timingSafeEqual,
    cryptoUtil,
    makeAccessToken,
    makeRefreshToken,
    clock,
  );

  return {
    prismaTsx,
    prismaClient,
    timingSafeEqual,
    cryptoUtil,
    makeAccessToken,
    makeRefreshToken,
    refreshSessionUsecase,
    clock,
    authSession,
    user,
  };
}

describe("RefreshSessionUsecase.ts (unit)", () => {
  it("throws ForbiddenException if no auth session exists", async () => {
    const { prismaTsx, refreshSessionUsecase } = createSut();

    (prismaTsx.authSession.findUnique as Mock).mockResolvedValue(null);

    const promise = refreshSessionUsecase.execute({
      authenticatedSession: { refreshToken: "refreshToken", sessionId: "sessionId" },
    });

    await expect(promise).rejects.toThrow(ForbiddenException);

    await expect(promise).rejects.toThrow("Invalid or expired session");
  });

  it("throws if the auth session is revoked", async () => {
    const { prismaTsx, refreshSessionUsecase } = createSut();

    (prismaTsx.authSession.findUnique as Mock).mockResolvedValue(
      new AuthSessionBuilder().withRevoked().build(),
    );

    const promise = refreshSessionUsecase.execute({
      authenticatedSession: { refreshToken: "refreshToken", sessionId: "sessionId" },
    });

    await expect(promise).rejects.toThrow(ForbiddenException);

    await expect(promise).rejects.toThrow("Invalid or expired session");
  });

  it("revokes session and throws ForbiddenException if the auth session is expired", async () => {
    const { prismaTsx, refreshSessionUsecase, clock, authSession } = createSut();

    clock.now.mockReturnValue(authSession.expires_at.getTime() + 1000);

    const promise = refreshSessionUsecase.execute({
      authenticatedSession: { refreshToken: "refreshToken", sessionId: "sessionId" },
    });

    await expect(promise).rejects.toThrow(ForbiddenException);

    await expect(promise).rejects.toThrow("Invalid or expired session");

    expect(prismaTsx.authSession.update).toHaveBeenCalledWith({
      data: { is_revoked: true },
      where: { id: authSession.id },
    });
  });

  it("revokes session and throws ForbiddenException if the token hash is not valid", async () => {
    const { prismaTsx, cryptoUtil, refreshSessionUsecase, authSession, timingSafeEqual } =
      createSut();

    cryptoUtil.hmacSHA256.mockReturnValue("hash");

    timingSafeEqual.mockReturnValue(false);

    const promise = refreshSessionUsecase.execute({
      authenticatedSession: { refreshToken: "refreshToken", sessionId: "sessionId" },
    });

    await expect(promise).rejects.toThrow(ForbiddenException);

    await expect(promise).rejects.toThrow("Invalid or expired session");

    expect(prismaTsx.authSession.updateMany).toHaveBeenCalledWith({
      data: { is_revoked: true },
      where: { token_family: authSession.token_family },
    });
  });

  it("throws ForbiddenException if there is no user associated with the auth session", async () => {
    const { prismaTsx, refreshSessionUsecase } = createSut();

    (prismaTsx.user.findUnique as Mock).mockResolvedValue(null);

    const promise = refreshSessionUsecase.execute({
      authenticatedSession: { refreshToken: "refreshToken", sessionId: "sessionId" },
    });

    await expect(promise).rejects.toThrow(ForbiddenException);

    await expect(promise).rejects.toThrow("Invalid or expired session");
  });

  it("throws ForbiddenException if no authSession entry was updated in the database", async () => {
    const { prismaTsx, refreshSessionUsecase } = createSut();

    (prismaTsx.authSession.updateMany as Mock).mockResolvedValue({ count: 0 });

    const promise = refreshSessionUsecase.execute({
      authenticatedSession: { refreshToken: "refreshToken", sessionId: "sessionId" },
    });

    await expect(promise).rejects.toThrow(ForbiddenException);

    await expect(promise).rejects.toThrow("Invalid or expired session");
  });

  it("updates the token hash when refresh succeeds", async () => {
    const { prismaTsx, refreshSessionUsecase } = createSut();

    await refreshSessionUsecase.execute({
      authenticatedSession: { refreshToken: "refreshToken", sessionId: "sessionId" },
    });

    expect(prismaTsx.authSession.updateMany).toHaveBeenCalled();
  });

  it("returns the accessToken, refreshToken and refresh token expiration", async () => {
    const { refreshSessionUsecase, authSession, user, makeAccessToken, makeRefreshToken, clock } =
      createSut();

    const result = await refreshSessionUsecase.execute({
      authenticatedSession: { refreshToken: "refreshToken", sessionId: "sessionId" },
    });

    expect(makeAccessToken).toHaveBeenCalled();
    expect(makeRefreshToken).toHaveBeenCalled();

    const expectedResult: Awaited<ReturnType<RefreshSessionUsecase["execute"]>> = {
      accessToken: "accessToken",
      sessionId: authSession.id,
      refreshToken: "refreshToken",
      refreshTokenExpiryMs: authSession.expires_at.getTime() - clock.now(),
      userId: user.id,
      username: user.username,
    };

    expect(result).toEqual(expectedResult);
  });

  it("throws ForbiddenException if no authenticated session exists", async () => {
    const { refreshSessionUsecase, authSession, user, makeAccessToken, makeRefreshToken, clock } =
      createSut();

    await expect(refreshSessionUsecase.execute({ authenticatedSession: null })).rejects.toThrow(
      ForbiddenException,
    );
  });
});
