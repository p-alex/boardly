import { string, refine } from "zod/v4-mini";

export const pwnedPasswordsResponseDtoSchema = string().check(
  refine(
    (val) => val.split("\r\n").every((line) => /^[A-F0-9]{35}:\d+$/.test(line)),
    "Invalid Pwned Passwords response format",
  ),
);

export type PwnedPasswordResponseDto = typeof pwnedPasswordsResponseDtoSchema._zod.output;
