import { number, object, string, enum as _enum } from "zod/v4-mini";

export const serverErrorResponseDtoSchema = object({
  status: number(),
  message: string(),
});

export type ServerErrorResponseDto = typeof serverErrorResponseDtoSchema._zod.output;
