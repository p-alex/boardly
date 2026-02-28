import { CryptoUtil } from "@boardly/shared/utils";
import { Mocked, vi } from "vitest";
import { UserPasswordAuth } from "../../../generated/prisma_client/client";
import { IEnv } from "../../config";
import { UserPasswordAuthFactory } from "../factories/UserPasswordAuthFactory";

vi.mock("../../config.js", () => ({
  env: {
    PEPPERS: {
      PASSWORD: {
        ACTIVE_VERSION: "V1",
        V1: "V1",
        V2: "V2",
      },
    },
  } as IEnv,
}));

describe("UserPasswordAuthFactory.ts (unit)", () => {
  let cryptoMock: Mocked<CryptoUtil>;
  let userPasswordAuthFactory: UserPasswordAuthFactory;

  beforeEach(() => {
    cryptoMock = {
      hashPassword: vi.fn(() => "hashedPassword"),
    } as unknown as Mocked<CryptoUtil>;

    userPasswordAuthFactory = new UserPasswordAuthFactory(cryptoMock);
  });

  it("should create a valid UserPasswordAuth enitity", async () => {
    const result = await userPasswordAuthFactory.create({
      user_id: "user_id",
      password: "password",
    });

    expect(result).toMatchObject({
      user_id: "user_id",
      password_hash: "hashedPassword",
      password_pepper_version: "V1",
    } as Partial<UserPasswordAuth>);

    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it("should hash password using pepper", async () => {
    await userPasswordAuthFactory.create({
      user_id: "user_id",
      password: "password",
    });

    expect(cryptoMock.hashPassword).toHaveBeenCalledWith("password" + "V1");
  });
});
