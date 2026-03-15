import {
  ACCESS_TOKEN_AUDIENCE,
  ACCESS_TOKEN_ISSUER,
  AccessTokenData,
} from "../infrastructure/auth/makeAccessToken.js";

export const accessTokenPayloadFixture: AccessTokenData = {
  id: "id",
  aud: ACCESS_TOKEN_AUDIENCE,
  exp: 2000,
  iat: 1000,
  iss: ACCESS_TOKEN_ISSUER,
};
