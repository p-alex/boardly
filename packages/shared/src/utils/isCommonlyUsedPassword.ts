import { commonlyUsedPasswords } from "../most-used-12-char-passwords.js";

export function isCommonlyUsedPassword(password: string) {
  return commonlyUsedPasswords[password] === 0;
}
