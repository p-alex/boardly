import { CookieConfigType } from "../interfaces/controllers/auth/PasswordSignUpController/index.js";

export const cookieFixture: CookieConfigType = {
  domain: "domain",
  isHttpOnly: true,
  isSecure: true,
  maxAgeMS: 1000,
  name: "name",
  path: "/",
  sameSite: "strict",
  value: "value",
};
