import { object, string } from "zod/v4-mini";

export const userDtoSchema = object({
  id: string(),
  username: string(),
  created_at: string(),
});

export type UserDtoType = typeof userDtoSchema._zod.output;
