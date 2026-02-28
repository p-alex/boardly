import { Mocked, vi } from "vitest";
import { CryptoUtil } from "@boardly/shared/utils";
import { mockUser } from "../../__fixtures__/user/mockUser";
import { User } from "../../../generated/prisma_client/client";
import { IEnv } from "../../config";
import { UserFactory } from "../factories/UserFactory";

vi.mock("../../config.js", () => ({
  env: {
    ENCRYPTION_SECRETS: {
      EMAIL: {
        ACTIVE_VERSION: "V1",
        V1: "V1",
        V2: "V2",
      },
    },
    HASH_SECRETS: {
      EMAIL: {
        ACTIVE_VERSION: "V1",
        V1: "V1",
        V2: "V2",
      },
    },
  } as IEnv,
}));

describe("UserFactory.ts (unit)", () => {
  let cryptoMock: Mocked<CryptoUtil>;
  let userFactory: UserFactory;

  beforeEach(() => {
    cryptoMock = {
      randomUUID: vi.fn().mockReturnValue("randomUUID"),
      hmacSHA256: vi.fn().mockReturnValue("hmacSHA256"),
      encrypt: vi.fn().mockReturnValue("encrypted"),
    } as unknown as Mocked<CryptoUtil>;

    userFactory = new UserFactory(cryptoMock);
  });

  it("should create a valid user entity", () => {
    const result = userFactory.create({
      username: mockUser.username,
      email: "email@email.com",
    });

    expect(result).toMatchObject({
      id: "randomUUID",
      username: mockUser.username,
      email_encryption_secret_version: "V1",
      email_hash_secret_version: "V1",
      email_verified: false,
      hashed_email: "hmacSHA256",
      encrypted_email: "encrypted",
    } as User);

    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it("should hash email using current secret", () => {
    userFactory.create({
      username: mockUser.username,
      email: "email@email.com",
    });

    expect(cryptoMock.hmacSHA256).toHaveBeenCalledWith("email@email.com", "V1");
  });

  it("should encrypt email using current secret", () => {
    userFactory.create({
      username: mockUser.username,
      email: "email@email.com",
    });

    expect(cryptoMock.encrypt).toHaveBeenCalledWith("email@email.com", "V1");
  });
});
