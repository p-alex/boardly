import { Mocked, vi } from "vitest";

import { PasswordSignUpUsecase } from "../../../../application/usecases/user/PasswordSignUpUsecase/PasswordSignUpUsecase";

import { PasswordSignUpController } from "./PasswordSignUpController";

import { mockHttpRequest } from "../../../../__fixtures__/request/index";
import { IEnv } from "../../../../config";

vi.mock("../../../config", () => ({
  env: {
    CLIENT_BASE_URL: "base_url",
    EMAIL_API: {
      PASS: "pass",
      SENDER: "sender",
      USER: "user",
    },
  } as IEnv,
}));

describe("PasswordSignUpController.ts (unit)", () => {
  let passwordSignUpController: PasswordSignUpController;
  let passwordSignUpUsecase: Mocked<PasswordSignUpUsecase>;

  beforeEach(() => {
    passwordSignUpUsecase = {
      execute: vi.fn().mockResolvedValue(null),
    } as unknown as Mocked<PasswordSignUpUsecase>;

    passwordSignUpController = new PasswordSignUpController(passwordSignUpUsecase);
  });

  it("returns correctly", async () => {
    const result = await passwordSignUpController.handle(mockHttpRequest);

    expect(result).toEqual({ code: 201, result: null });
  });
});
