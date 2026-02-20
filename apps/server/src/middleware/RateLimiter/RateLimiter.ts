import { IMiddleware, MiddlewareResponse } from "../index.js";
import TooManyRequestsException from "../../exceptions/TooManyRequestsException.js";
import { HttpRequest } from "../../interfaces/adapters/index.js";

interface RateLimitParams {
  windowMs: number;
  maxRequests: number;
}

interface LimitedIp {
  windowMs: number;
  maxRequests: number;
  requests: number;
  firstRequestTime: number;
  expireTime: number;
}

export class RateLimiter implements IMiddleware {
  private _limitedIps: Map<string, LimitedIp>;
  private _maxKeys: number;

  constructor() {
    this._limitedIps = new Map<string, LimitedIp>();
    this._maxKeys = 100;
  }

  setup = (params: RateLimitParams) => {
    return async (httpReq: HttpRequest): Promise<MiddlewareResponse> => {
      const key = this._getKey(httpReq);

      const now = Date.now();

      const hasKey = this._limitedIps.has(key);

      if (!hasKey) {
        this._limitedIps.set(key, {
          windowMs: params.windowMs,
          maxRequests: params.maxRequests,
          requests: 0,
          firstRequestTime: now,
          expireTime: now + params.windowMs,
        });
      }

      if (this._limitedIps.size >= this._maxKeys) {
        this._deleteOldestLimitedIp();
      }

      const limitedIp = this._limitedIps.get(key) as LimitedIp;

      if (now >= limitedIp.expireTime) {
        limitedIp.requests = 0;
        limitedIp.expireTime = now + limitedIp.windowMs;
      }

      limitedIp.requests += 1;

      if (limitedIp.requests > limitedIp.maxRequests)
        throw new TooManyRequestsException(
          this._getTooManyRequestsErrorMessage(limitedIp),
          this._getHeaders(limitedIp),
        );

      this._limitedIps.set(key, limitedIp);

      console.log(this._limitedIps);

      return { isOk: true };
    };
  };

  setMaxLimitedIps = (max: number) => {
    this._maxKeys = max;
  };

  getLimitedIpsSize = () => {
    return this._limitedIps.size;
  };

  private _getTimeUntilReset = (limitedIp: LimitedIp) => {
    const now = Math.floor(Date.now() / 1000 / 60);
    const resetMinutes = Math.floor(limitedIp.expireTime / 1000 / 60 - now);
    return resetMinutes;
  };

  private _getTooManyRequestsErrorMessage = (limitedIp: LimitedIp) => {
    const timeUntilReset = this._getTimeUntilReset(limitedIp).toString();
    return `Too many requests. Try again in ${timeUntilReset} ${Number(timeUntilReset) === 1 ? "minute" : "minutes"}.`;
  };

  private _getHeaders = (limitedIp: LimitedIp) => {
    const now = Date.now();
    const resetMinutes = Math.ceil(limitedIp.expireTime / 1000 / 60 - now / 1000 / 60);
    const headers = {
      "X-RateLimit-Limit": limitedIp.maxRequests.toString(),
      "X-RateLimit-Remaining": Math.max(limitedIp.maxRequests - limitedIp.requests, 0).toString(),
      "X-RateLimit-Reset": resetMinutes.toString(),
    };
    return headers;
  };

  private _deleteOldestLimitedIp = () => {
    let oldestLimitedIpKey = "";
    let oldestLimitedIpTime = Date.now();

    this._limitedIps.forEach((limitedIp, key) => {
      if (limitedIp.firstRequestTime < oldestLimitedIpTime) {
        oldestLimitedIpTime = limitedIp.firstRequestTime;
        oldestLimitedIpKey = key;
      }
    });

    this._limitedIps.delete(oldestLimitedIpKey);
  };

  private _getKey = (req: HttpRequest) => {
    const ip = req.client_ip;
    const url = req.url.split("?")[0];
    const method = req.method;
    return ip + "|" + url + "|" + method;
  };
}

const rateLimiter = new RateLimiter();

export default rateLimiter;
