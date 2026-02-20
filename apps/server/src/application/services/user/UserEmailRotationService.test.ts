import { Mock, Mocked, vi } from "vitest";
import { CryptoUtil } from "@boardly/shared/utils";
import { mockUser } from "../../../__fixtures__/user/mockUser";
import { PrismaTsx } from "..";
import { IEnv } from "../../../config";
import { User } from "../../../../generated/prisma_client/client";

vi.mock("../../../config", () => ({
  env: {
    HASH_SECRETS: {
      EMAIL: {
        ACTIVE_VERSION: "V1",
        V1: "V1",
        V2: "V2",
      },
    },
    ENCRYPTION_SECRETS: {
      EMAIL: { ACTIVE_VERSION: "V2", V1: "V1", V2: "V2" },
    },
  } as IEnv,
}));

describe("UserEmailRotationService.ts (unit)", () => {
  let userEmailRotationService: any;

  let cryptoUtilMock: Mocked<CryptoUtil>;

  let tsxPrismaMock: Mocked<PrismaTsx>;

  beforeEach(async () => {
    tsxPrismaMock = {
      user: {
        update: vi
          .fn()
          .mockResolvedValue({ ...mockUser, email_encryption_secret_version: "V2" } as User),
      },
    } as unknown as Mocked<PrismaTsx>;

    vi.mock("../../../prisma.js", () => ({
      prisma: {
        user: {
          update: vi.fn().mockResolvedValue({ ...mockUser, username: "updatedWithPrisma" }),
        },
      },
    }));

    const { UserEmailRotationService } =
      await import("../../services/user/UserEmailRotationService");

    cryptoUtilMock = {
      hmacSHA256: vi.fn(() => "hashed_email"),
      encrypt: vi.fn(() => "encrypted_email"),
    } as unknown as Mocked<CryptoUtil>;

    userEmailRotationService = new UserEmailRotationService(cryptoUtilMock);
  });

  it("uses prisma if transaction prisma not provided", async () => {
    const result = await userEmailRotationService.execute(null, {
      userId: "userId",
      email: "email@email.com",
    });

    expect(result).toEqual({ ...mockUser, username: "updatedWithPrisma" });
  });

  it("hashes the email correctly using active email hash secret", async () => {
    await userEmailRotationService.execute(tsxPrismaMock, {
      userId: "userId",
      email: "email@email.com",
    });

    expect(cryptoUtilMock.hmacSHA256).toHaveBeenCalledTimes(1);

    expect(cryptoUtilMock.hmacSHA256).toHaveBeenCalledWith("email@email.com", "V1");
  });

  it("encrypts the email correctly using active email encryption secret", async () => {
    await userEmailRotationService.execute(tsxPrismaMock, {
      userId: "userId",
      email: "email@email.com",
    });

    expect(cryptoUtilMock.encrypt).toHaveBeenCalledTimes(1);

    expect(cryptoUtilMock.encrypt).toHaveBeenCalledWith("email@email.com", "V2");
  });

  it("updates the user correctly", async () => {
    await userEmailRotationService.execute(tsxPrismaMock, {
      userId: "userId",
      email: "email@email.com",
    });

    expect(tsxPrismaMock.user.update).toHaveBeenCalledTimes(1);

    expect(tsxPrismaMock.user.update).toHaveBeenCalledWith({
      data: {
        hashed_email: "hashed_email",
        encrypted_email: "encrypted_email",
        email_hash_secret_version: "V1",
        email_encryption_secret_version: "V2",
      } as Partial<User>,
      where: { id: "userId" },
    });
  });

  it("returns the updated user", async () => {
    const result = await userEmailRotationService.execute(tsxPrismaMock, {
      userId: "userId",
      email: "email@email.com",
    });

    expect(result).toEqual({
      ...mockUser,
      hashed_email: "hashed_email",
      encrypted_email: "encrypted_email",
      email_hash_secret_version: "V1",
      email_encryption_secret_version: "V2",
    } as User);
  });

  it("throws if db update fails", async () => {
    (tsxPrismaMock.user.update as Mock).mockRejectedValueOnce(new Error("db error"));

    await expect(
      userEmailRotationService.execute(tsxPrismaMock, {
        userId: "userId",
        email: "email@email.com",
      }),
    ).rejects.toThrow();
  });
});
