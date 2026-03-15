import { vi } from "vitest";
import { Response } from "express";

export const mockRes = {
  status: vi.fn(),
  json: vi.fn(),
  setHeader: vi.fn(),
  redirect: vi.fn(),
  cookie: vi.fn(),
} as unknown as Response;
