import { DefaultArgs } from "@prisma/client/runtime/client";
import { PrismaClient } from "../../../generated/prisma_client/internal/class.js";

export type PrismaTsx = Omit<
  PrismaClient<never, undefined, DefaultArgs>,
  "$on" | "$connect" | "$disconnect" | "$transaction" | "$extends"
>;

export interface IService {
  execute: (tsx: PrismaTsx | null, ...args: any[]) => any;
}
