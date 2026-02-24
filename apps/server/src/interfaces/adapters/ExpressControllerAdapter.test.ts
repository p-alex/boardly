import { Mocked, vi } from "vitest";
import { ExpressControllerAdapter } from "./ExpressControllerAdapter";
import { ControllerResponse, IController } from "../controllers/auth/EmailSignUpController";
import { mockReq } from "../../__fixtures__/request/mockReq";
import { mockRes } from "../../__fixtures__/response/mockRes";

describe("ExpressControllerAdapter.ts (unit)", () => {
  let expressControllerAdapter: ExpressControllerAdapter;
  let mockController: Mocked<IController>;

  beforeEach(() => {
    mockController = {
      handle: vi.fn().mockResolvedValue({
        code: 200,
        result: { test: "test" },
      } as ControllerResponse<{
        test: "test";
      }>),
    };
    expressControllerAdapter = new ExpressControllerAdapter();
  });

  it("should adapt express to controller and respond correctly", async () => {
    const handler = expressControllerAdapter.adapt(mockController);

    await handler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ test: "test" });
  });

  it("should handle errors", async () => {
    mockController.handle = vi.fn().mockRejectedValue(new Error("error"));

    const handler = expressControllerAdapter.adapt(mockController);

    await handler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalled();
  });
});
