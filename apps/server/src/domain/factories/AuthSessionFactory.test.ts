import { Mocked, vi } from "vitest";
import { AuthSessionFactory, SESSION_EXPIRES_AT } from "./AuthSessionFactory";
import { Clock, CryptoUtil } from "@boardly/shared/utils";
import { AuthSession } from "../../../generated/prisma_client/client";

function createSut() {
  const cryptoUtil = {
    hmacSHA256: vi.fn().mockReturnValue("hash"),
    randomUUID: vi.fn().mockReturnValue("uuid"),
  } as unknown as Mocked<CryptoUtil>;

  const clock = { now: vi.fn().mockReturnValue(1000) } as unknown as Mocked<Clock>;

  const authSessionFactory = new AuthSessionFactory(cryptoUtil, clock);

  return { cryptoUtil, authSessionFactory, clock };
}

describe("AuthSessionFactory.ts (unit)", () => {
  it("returns a correct auth session", () => {
    const { authSessionFactory, clock, cryptoUtil } = createSut();

    const result = authSessionFactory.create({ id: "id", token: "token", user_id: "user_id" });

    expect(cryptoUtil.hmacSHA256).toHaveBeenCalled();
    expect(cryptoUtil.randomUUID).toHaveBeenCalled();

    const expectedResult: AuthSession = {
      id: "id",
      created_at: new Date(clock.now()),
      expires_at: new Date(clock.now() + SESSION_EXPIRES_AT),
      is_revoked: false,
      token_family: "uuid",
      token_hash: "hash",
      user_id: "user_id",
    };

    expect(result).toEqual(expectedResult);
  });
});
