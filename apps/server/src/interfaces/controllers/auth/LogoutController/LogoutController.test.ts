import { Mocked, vi } from "vitest";
import { LogoutUsecase } from "../../../../application/usecases/auth/LogoutUsecase/LogoutUsecase";
import { cookieFixture } from "../../../../__fixtures__/cookieFixture";
import { LogoutController } from "./LogoutController";
import { mockHttpRequest } from "../../../../__fixtures__/request";

function createSut() {
  const logoutUsecase = {
    execute: vi.fn(),
  } as unknown as Mocked<LogoutUsecase>;

  const makeRefreshTokenCookie = vi.fn().mockReturnValue(cookieFixture);

  const logoutController = new LogoutController(logoutUsecase, makeRefreshTokenCookie);

  return {
    logoutUsecase,
    makeRefreshTokenCookie,
    logoutController,
  };
}

describe("LogoutController.ts (unit)", () => {
  it("runs logout usecase", async () => {
    const { logoutController, logoutUsecase } = createSut();

    await logoutController.handle(mockHttpRequest);

    expect(logoutUsecase.execute).toHaveBeenCalled();
  });

  it("removes refresh token cookie", async () => {
    const { logoutController, makeRefreshTokenCookie } = createSut();

    await logoutController.handle(mockHttpRequest);

    expect(makeRefreshTokenCookie).toHaveBeenCalledWith("", "", 0);
  });
});
