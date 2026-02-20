import { Mock, Mocked, vi } from "vitest";
import { mockUser } from "../../../__fixtures__/user/mockUser";

import { UserEmailFinderService } from "../../services/user/UserEmailFinderService";
import { CryptoUtil } from "@boardly/shared/utils";
import { PrismaTsx } from "..";

import { IEnv } from "../../../config";

type ServiceReturnType = Awaited<ReturnType<UserEmailFinderService["execute"]>>;

vi.mock("../../../prisma.js", () => ({
  prisma: {
    user: {
      findUnique: vi.fn().mockResolvedValue({ ...mockUser, username: "foundWithRegular" }),
    },
  },
}));

vi.mock(
  "../../../config",
  () =>
    ({
      env: {
        HASH_SECRETS: {
          EMAIL: {
            ACTIVE_VERSION: "V1",
            V1: "V1",
            V2: "V2",
            VERSIONS: ["V1", "V2"],
          },
        },
      },
    }) as unknown as IEnv,
);

describe("UserEmailFinderService.ts (unit)", () => {
  let userEmailFinderService: UserEmailFinderService;

  let cryptoUtilMock: Mocked<CryptoUtil>;

  let prismaMock: Mocked<PrismaTsx>;

  beforeEach(() => {
    prismaMock = {
      user: {
        findUnique: vi.fn().mockResolvedValue(mockUser),
      },
    } as unknown as Mocked<PrismaTsx>;

    cryptoUtilMock = {
      hmacSHA256: vi.fn(() => "hashed_email"),
    } as unknown as Mocked<CryptoUtil>;

    userEmailFinderService = new UserEmailFinderService(cryptoUtilMock);
  });

  it("should return the user if found with the active email hash secret", async () => {
    const result = await userEmailFinderService.execute(prismaMock, { email: "email@email.com" });

    const expectedResult: ServiceReturnType = { user: mockUser, foundWithInactiveSecret: false };

    expect(cryptoUtilMock.hmacSHA256).toHaveBeenCalledWith("email@email.com", "V1");

    expect(result).toEqual(expectedResult);
  });

  it("should return the user if found with one of the inactive hash secrets", async () => {
    (prismaMock.user.findUnique as Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(mockUser);

    const result = await userEmailFinderService.execute(prismaMock, { email: "email@email.com" });

    const expectedResult: ServiceReturnType = { user: mockUser, foundWithInactiveSecret: true };

    expect(cryptoUtilMock.hmacSHA256).toHaveBeenCalledWith("email@email.com", "V2");

    expect(result).toEqual(expectedResult);
  });

  it("should return the user as null if it was not found with the active hash secret nor other secrets", async () => {
    (prismaMock.user.findUnique as Mock).mockResolvedValue(null);

    const result = await userEmailFinderService.execute(prismaMock, { email: "email@email.com" });

    const expectedResult: ServiceReturnType = { user: null, foundWithInactiveSecret: false };

    expect(cryptoUtilMock.hmacSHA256).toHaveBeenCalledWith("email@email.com", "V2");

    expect(result).toEqual(expectedResult);
  });

  it("should use the regular db client if no transaction db client is provided", async () => {
    const result = await userEmailFinderService.execute(null, { email: "email@email.com" });

    const expectedResult: ServiceReturnType = {
      user: { ...mockUser, username: "foundWithRegular" },
      foundWithInactiveSecret: false,
    };

    expect(cryptoUtilMock.hmacSHA256).toHaveBeenCalledWith("email@email.com", "V1");

    expect(result).toEqual(expectedResult);
  });
});
