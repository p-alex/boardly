import { object, string } from "zod/v4-mini";

export const refreshSessionResponseDto = object({
  accessToken: string(),
  user: object({
    id: string(),
    username: string(),
  }),
});

export type RefreshSessionResponseDto = typeof refreshSessionResponseDto._zod.output;
