import { Mock, Mocked, vi } from "vitest";
import { AuthSessionFactory } from "../../../../domain/factories/AuthSessionFactory";
import { PrismaClient } from "../../../../../generated/prisma_client/client";
import makeRefreshToken from "../../../../infrastructure/auth/makeRefreshToken.js";
import { authSessionFixture } from "../../../../__fixtures__";

vi.mock("../../../../prisma.js", () => ({
  prisma: {
    authSession: {
      create: vi.fn(),
    },
  } as unknown as PrismaClient,
}));

import { CreateAuthSessionService } from "./CreateAuthSessionService";
import { prisma } from "../../../../prisma.js";
import { PrismaTsx } from "../../index.js";

const refreshToken = "token";

describe("CreateAuthSessionService.ts (unit)", () => {
  let createAuthSessionService: CreateAuthSessionService;

  let makeRefreshTokenMock: Mock;

  let authSessionFactory: Mocked<AuthSessionFactory>;

  beforeEach(() => {
    makeRefreshTokenMock = vi.fn().mockReturnValue("token");

    authSessionFactory = {
      create: vi.fn().mockReturnValue(authSessionFixture),
    } as unknown as Mocked<AuthSessionFactory>;

    createAuthSessionService = new CreateAuthSessionService(
      makeRefreshTokenMock,
      authSessionFactory,
    );
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("makes a refresh token", async () => {
    await createAuthSessionService.execute(null, { user_id: "user_id" });
    expect(makeRefreshTokenMock).toHaveBeenCalled();
  });

  it("creates new auth session", async () => {
    await createAuthSessionService.execute(null, { user_id: "user_id" });

    expect(authSessionFactory.create).toHaveBeenCalledWith({
      refreshToken: "token",
      user_id: "user_id",
    });
  });

  it("inserts the newly created auth session into the database", async () => {
    await createAuthSessionService.execute(null, { user_id: "user_id" });

    expect(prisma.authSession.create).toHaveBeenCalledWith({ data: authSessionFixture });
    expect(prisma.authSession.create).toHaveBeenCalledTimes(1);
  });

  it("returns correctly", async () => {
    (prisma.authSession.create as Mock).mockResolvedValue(authSessionFixture);

    const result = await createAuthSessionService.execute(null, { user_id: "user_id" });

    const expectedResult: Awaited<ReturnType<CreateAuthSessionService["execute"]>> = {
      authSession: authSessionFixture,
      refreshToken,
    };

    expect(result).toEqual(expectedResult);
  });

  it("uses tsx instead of prisma if provided", async () => {
    const prismaTsx = {
      authSession: {
        create: vi.fn(),
      },
    } as unknown as PrismaTsx;

    const result = await createAuthSessionService.execute(prismaTsx, { user_id: "user_id" });

    expect(prisma.authSession.create).not.toHaveBeenCalled();
    expect(prismaTsx.authSession.create).toHaveBeenCalled();
  });
});
