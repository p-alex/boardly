import { Mock, Mocked, MockedClass, vi } from "vitest";
import { ExpressMiddlewareAdapter } from "../adapters/ExpressMiddlewareAdapter";
import { IMiddleware, MiddlewareResponse } from "../../middleware";
import { mockReq } from "../../__fixtures__/request/mockReq";
import { mockRes } from "../../__fixtures__/response/mockRes";

describe("ExpressMiddlewareAdapter.ts (unit)", () => {
  let expressMiddlewareAdapter: ExpressMiddlewareAdapter;
  let mockMiddleware: Mocked<IMiddleware>;
  let handlerMock: Mock;
  let nextFuncMock: Mock;

  beforeEach(() => {
    nextFuncMock = vi.fn();
    handlerMock = vi.fn().mockResolvedValue({ isOk: true });
    mockMiddleware = {
      setup: vi.fn().mockReturnValue(handlerMock),
    };
    expressMiddlewareAdapter = new ExpressMiddlewareAdapter();
  });

  it("should call the next middlware if current middleware returns ok", async () => {
    const handler = expressMiddlewareAdapter.adapt(mockMiddleware.setup());

    await handler(mockReq, mockRes, nextFuncMock);

    expect(nextFuncMock).toHaveBeenCalled();
  });

  it("should not call the next middleware if current middleware returns not ok", async () => {
    handlerMock.mockResolvedValue({ isOk: false });

    const handler = expressMiddlewareAdapter.adapt(mockMiddleware.setup());

    await handler(mockReq, mockRes, nextFuncMock);

    expect(nextFuncMock).not.toHaveBeenCalled();
  });

  it("should handle errors", async () => {
    handlerMock.mockRejectedValue(new Error("error"));

    const handler = expressMiddlewareAdapter.adapt(mockMiddleware.setup());

    await handler(mockReq, mockRes, nextFuncMock);

    expect(mockRes.status).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalled();
  });
});
