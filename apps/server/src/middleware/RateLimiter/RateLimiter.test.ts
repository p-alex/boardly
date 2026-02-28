import { vi } from "vitest";
import { RateLimiter } from "../RateLimiter/RateLimiter";
import { mockHttpRequest } from "../../__fixtures__/request/mockHttpReq";
import { MiddlewareResponse } from "..";
import TooManyRequestsException from "../../exceptions/TooManyRequestsException";

describe("RateLimiter.ts (unit)", () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter();
  });

  it("should return ok if request is within limits", async () => {
    const handler = rateLimiter.setup({ maxRequests: 1, windowMs: 1000 });

    const result = await handler(mockHttpRequest);

    expect(result).toEqual({ isOk: true } as MiddlewareResponse);
  });

  it("should throw TooManyRequestsException with correct headers if limits exceeded", async () => {
    const handler = rateLimiter.setup({ maxRequests: 1, windowMs: 1000 * 60 * 5 });

    await handler(mockHttpRequest);

    try {
      await handler(mockHttpRequest);
    } catch (error) {
      expect(error).toBeInstanceOf(TooManyRequestsException);
      if (error instanceof TooManyRequestsException) {
        expect(error.headers).toEqual({
          "X-RateLimit-Limit": "1",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": "5",
        });
      }
    }
  });

  it("should reset limited ip if window ms passed", async () => {
    vi.useFakeTimers();

    const handler = rateLimiter.setup({ maxRequests: 1, windowMs: 1000 * 60 * 1 });

    await handler(mockHttpRequest);
    await expect(handler(mockHttpRequest)).rejects.toThrow(TooManyRequestsException);

    await vi.advanceTimersByTimeAsync(1000 * 60 * 2);

    const result = await handler(mockHttpRequest);
    expect(result).toEqual({ isOk: true });

    vi.useRealTimers();
  });

  it("should delete oldest limited ip if max ips limit is reached", async () => {
    vi.useFakeTimers({ now: 1771520147042 });

    rateLimiter.setMaxLimitedIps(1);

    const handler = rateLimiter.setup({ maxRequests: 2, windowMs: 1000 * 60 * 1 });

    await handler({ ...mockHttpRequest, client_ip: "first client_ip" });

    expect(rateLimiter.getLimitedIpsSize()).toBe(1);

    await vi.advanceTimersByTimeAsync(1000 * 60 * 3);

    mockHttpRequest.client_ip = "another client";

    await handler({ ...mockHttpRequest, client_ip: "another_one" });

    expect(rateLimiter.getLimitedIpsSize()).toBe(1);

    vi.useRealTimers();
  });

  it("should respond with time until next request message in minutes if TooManyRequestException is thrown", async () => {
    const handler = rateLimiter.setup({ maxRequests: 1, windowMs: 1000 * 60 * 5 });

    await handler(mockHttpRequest);

    try {
      await handler(mockHttpRequest);
    } catch (error) {
      expect(error).toBeInstanceOf(TooManyRequestsException);
      if (error instanceof TooManyRequestsException) {
        expect(error.message).toBe("Too many requests. Try again in 5 minutes.");
      }
    }
  });

  it("should respond with 'minute' instead of 'minutes' if there is only 1 minute until next request when TooManyRequestException is thrown", async () => {
    const handler = rateLimiter.setup({ maxRequests: 1, windowMs: 1000 * 60 * 1 });

    await handler(mockHttpRequest);

    try {
      await handler(mockHttpRequest);
    } catch (error) {
      expect(error).toBeInstanceOf(TooManyRequestsException);
      if (error instanceof TooManyRequestsException) {
        expect(error.message).toBe("Too many requests. Try again in 1 minute.");
      }
    }
  });
});
