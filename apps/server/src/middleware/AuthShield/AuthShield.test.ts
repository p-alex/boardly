import { Mock, vi } from "vitest";
import { accessTokenPayloadFixture, requestFixtures } from "../../__fixtures__";
import UnauthorizedException from "../../exceptions/UnauthorizedException";
import * as jwtVerifier from "../../infrastructure/auth/verifyJwt";
import AuthShield from "./AuthShield";

function createSut() {
  const httpReqMock = { ...requestFixtures.mockHttpRequest };

  vi.spyOn(jwtVerifier, "verifyJwt").mockReturnValue(accessTokenPayloadFixture);

  return {
    authShield: new AuthShield(),
    httpReqMock,
  };
}

describe("AuthShield.ts (unit)", () => {
  it("throws UnauthorizedException if no access token is provided", async () => {
    const { authShield } = createSut();

    const handler = authShield.setup();

    await expect(
      handler({ ...requestFixtures.mockHttpRequest, accessToken: null }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("throws UnauthorizedException if jwt verification fails", async () => {
    const { authShield } = createSut();

    (jwtVerifier.verifyJwt as Mock).mockImplementation(() => {
      throw new Error("invalid or expired");
    });

    const handler = authShield.setup();

    await expect(handler(requestFixtures.mockHttpRequest)).rejects.toThrow(UnauthorizedException);
  });

  it("throws UnauthorizedException if token payload contains incorrect issuer info", async () => {
    const { authShield } = createSut();

    (jwtVerifier.verifyJwt as Mock).mockReturnValue({ ...accessTokenPayloadFixture, iss: "wrong" });

    const handler = authShield.setup();

    await expect(handler(requestFixtures.mockHttpRequest)).rejects.toThrow(UnauthorizedException);
  });

  it("throws UnauthorizedException if token payload contains incorrect audience info", async () => {
    const { authShield } = createSut();

    (jwtVerifier.verifyJwt as Mock).mockReturnValue({ ...accessTokenPayloadFixture, aud: "wrong" });

    const handler = authShield.setup();

    await expect(handler(requestFixtures.mockHttpRequest)).rejects.toThrow(UnauthorizedException);
  });

  it("returns isOk set to true if verfication passed", async () => {
    const { authShield, httpReqMock } = createSut();

    (jwtVerifier.verifyJwt as Mock).mockReturnValue({ ...accessTokenPayloadFixture });

    const handler = authShield.setup();

    const result = await handler(httpReqMock);

    expect(result).toEqual({
      isOk: true,
      updatedHttpRequest: { ...httpReqMock, authUser: { id: "id", sessionId: "sessionId" } },
    });
  });
});
