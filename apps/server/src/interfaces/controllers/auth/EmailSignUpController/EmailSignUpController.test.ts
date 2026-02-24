import { Mocked, vi } from "vitest";
import { SignUpUsecase } from "../../../../application/usecases/SignUpUsecase/SignUpUsecase";
import { EmailSignUpController } from "./EmailSignUpController";
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

describe("EmailSignUpController.ts (unit)", () => {
  let emailSignUpController: EmailSignUpController;
  let signUpUsecase: Mocked<SignUpUsecase>;

  beforeEach(() => {
    signUpUsecase = {
      execute: vi.fn().mockResolvedValue(null),
    } as unknown as Mocked<SignUpUsecase>;

    emailSignUpController = new EmailSignUpController(signUpUsecase);
  });

  it("returns correctly", async () => {
    const result = await emailSignUpController.handle(mockHttpRequest);

    expect(result).toEqual({ code: 201, result: null });
  });
});
