import { describe, it, expect, vi, beforeEach } from "vitest";
import { LogoutUsecase } from "./LogoutUsecase.js";
import UnauthorizedException from "../../../../exceptions/UnauthorizedException.js";
import { PrismaClient } from "../../../../../generated/prisma_client/client.js";

const createSut = () => {
  const prismaMock = {
    authSession: {
      update: vi.fn(),
    },
  };

  const logoutUsecase = new LogoutUsecase(prismaMock as unknown as PrismaClient);

  return {
    logoutUsecase,
    prismaMock,
  };
};

describe("LogoutUsecase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws UnauthorizedException if authUser is null", async () => {
    const { logoutUsecase } = createSut();

    await expect(logoutUsecase.execute({ authUser: null })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it("revokes the auth session when authUser exists", async () => {
    const { logoutUsecase, prismaMock } = createSut();

    const authUser = {
      id: "user-id",
      sessionId: "session-id",
    };

    prismaMock.authSession.update.mockResolvedValue({});

    await logoutUsecase.execute({ authUser });

    expect(prismaMock.authSession.update).toHaveBeenCalledWith({
      data: { is_revoked: true },
      where: {
        id: authUser.sessionId,
        user_id: authUser.id,
      },
    });
  });

  it("returns the prisma result", async () => {
    const { logoutUsecase, prismaMock } = createSut();

    const authUser = {
      id: "user-id",
      sessionId: "session-id",
    };

    const prismaResult = { id: "session-id", is_revoked: true };

    prismaMock.authSession.update.mockResolvedValue(prismaResult);

    const result = await logoutUsecase.execute({ authUser });

    expect(result).toEqual(prismaResult);
  });
});
