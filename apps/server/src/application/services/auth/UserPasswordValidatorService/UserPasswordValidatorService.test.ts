import { Mocked, vi } from "vitest";
import { CryptoUtil } from "@boardly/shared/utils";
import { UserPasswordValidatorService } from "./UserPasswordValidatorService";
import { IEnv } from "../../../../config";

vi.mock("../../../../config.js", () => ({
  env: { PEPPERS: { PASSWORD: { V1: "V1", V2: "V2", ACTIVE_VERSION: "V1" } } } as IEnv,
}));

describe("UserPasswordValidatorService.ts (unit)", () => {
  let userPasswordValidatorService: UserPasswordValidatorService;

  let cryptoUtil: Mocked<CryptoUtil>;

  beforeEach(() => {
    cryptoUtil = {
      verfyPasswordHash: vi.fn(),
    } as unknown as Mocked<CryptoUtil>;

    userPasswordValidatorService = new UserPasswordValidatorService(cryptoUtil);
  });

  it("returns correctly if the password + current pepper version is equal the the hash", async () => {
    cryptoUtil.verfyPasswordHash.mockResolvedValueOnce(true);

    const result = await userPasswordValidatorService.validate({
      hash: "hash",
      password: "password",
      password_pepper_version: "V1",
    });

    expect(cryptoUtil.verfyPasswordHash).toHaveBeenCalledWith("password" + "V1", "hash");

    expect(result).toEqual({ success: true, validPepperVersion: "V1" });
  });

  it("returns correctly if the password + other pepper version is equal to the hash", async () => {
    cryptoUtil.verfyPasswordHash.mockResolvedValueOnce(false);
    cryptoUtil.verfyPasswordHash.mockResolvedValueOnce(true);

    const result = await userPasswordValidatorService.validate({
      hash: "hash",
      password: "password",
      password_pepper_version: "V2",
    });

    expect(cryptoUtil.verfyPasswordHash).toHaveBeenCalledTimes(2);

    expect(cryptoUtil.verfyPasswordHash).toHaveBeenCalledWith("password" + "V2", "hash");

    expect(result).toEqual({ success: true, validPepperVersion: "V1" });
  });

  it("returns correctly if no passsword pepper is valid", async () => {
    cryptoUtil.verfyPasswordHash.mockResolvedValueOnce(false);
    cryptoUtil.verfyPasswordHash.mockResolvedValueOnce(false);

    const result = await userPasswordValidatorService.validate({
      hash: "hash",
      password: "password",
      password_pepper_version: "V2",
    });

    expect(cryptoUtil.verfyPasswordHash).toHaveBeenCalledTimes(2);

    expect(result).toEqual({ success: false });
  });
});
