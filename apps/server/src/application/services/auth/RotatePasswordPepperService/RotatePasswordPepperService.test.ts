import { Mock, Mocked, vi } from "vitest";
import { CryptoUtil } from "@boardly/shared/utils";
import { PrismaClient } from "../../../../../generated/prisma_client/client";
import { RotatePasswordPepperService } from "./RotatePasswordPepperService";
import { mockUserPasswordAuthMock } from "../../../../__fixtures__/userPasswordAuth";
import { IEnv } from "../../../../config";
import { prisma } from "../../../../prisma";
import { PrismaTsx } from "../..";

vi.mock("../../../../prisma.js", () => ({
  prisma: {
    userPasswordAuth: {
      update: vi.fn(),
    },
  } as unknown as PrismaClient,
}));

vi.mock("../../../../config.js", () => ({
  env: {
    PEPPERS: {
      PASSWORD: { ACTIVE_VERSION: "V1", V1: "V1", V2: "V2", VERSIONS: ["V1", "V2"] },
    },
  } as IEnv,
}));

describe("RotatePasswordPepperService.ts", () => {
  let rotatePasswordPepperService: RotatePasswordPepperService;

  let cryptoMock: Mocked<CryptoUtil>;

  beforeEach(async () => {
    cryptoMock = {
      hashPassword: vi.fn(),
    } as unknown as Mocked<CryptoUtil>;

    rotatePasswordPepperService = new RotatePasswordPepperService(cryptoMock);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("returns null if password is already using the active pepper version", async () => {
    const result = await rotatePasswordPepperService.execute(null, {
      password: "password",
      userPasswordAuth: { ...mockUserPasswordAuthMock, password_pepper_version: "V1" },
    });

    expect(result).toBe(null);
  });

  it("hashes password and adds the current pepper version", async () => {
    await rotatePasswordPepperService.execute(null, {
      password: "password",
      userPasswordAuth: { ...mockUserPasswordAuthMock, password_pepper_version: "V2" },
    });

    expect(cryptoMock.hashPassword).toHaveBeenCalledWith("password" + "V1");
  });

  it("updates user password auth inside database", async () => {
    vi.spyOn(Date, "now").mockReturnValue(1000);

    cryptoMock.hashPassword.mockResolvedValue("hashedPassword");

    await rotatePasswordPepperService.execute(null, {
      password: "password",
      userPasswordAuth: { ...mockUserPasswordAuthMock, password_pepper_version: "V2" },
    });

    expect(prisma.userPasswordAuth.update).toHaveBeenCalledWith({
      data: {
        password_hash: "hashedPassword",
        updated_at: new Date(1000),
        password_pepper_version: "V1",
      },
      where: {
        user_id: mockUserPasswordAuthMock.user_id,
      },
    });
  });

  it("returns the updated user password auth", async () => {
    (prisma.userPasswordAuth.update as Mock).mockResolvedValue(mockUserPasswordAuthMock);

    const result = await rotatePasswordPepperService.execute(null, {
      password: "password",
      userPasswordAuth: { ...mockUserPasswordAuthMock, password_pepper_version: "V2" },
    });

    expect(result).toEqual(mockUserPasswordAuthMock);
  });

  it("uses tsx instead of prisma if provided", async () => {
    const prismaTsxMock = {
      userPasswordAuth: {
        update: vi.fn(),
      },
    } as unknown as PrismaTsx;

    await rotatePasswordPepperService.execute(prismaTsxMock, {
      password: "password",
      userPasswordAuth: { ...mockUserPasswordAuthMock, password_pepper_version: "V2" },
    });

    expect(prismaTsxMock.userPasswordAuth.update).toHaveBeenCalled();

    expect(prisma.userPasswordAuth.update).not.toHaveBeenCalled();
  });
});
