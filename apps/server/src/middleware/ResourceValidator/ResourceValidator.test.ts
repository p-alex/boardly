import { Mocked, vi } from "vitest";

import { ResourceValidator } from "../../middleware/ResourceValidator/ResourceValidator";
import { ZodMiniObject } from "zod/v4-mini";
import { mockHttpRequest } from "../../__fixtures__/request/mockHttpReq";
import ValidationException from "../../exceptions/ValidationException";

describe("ResourceValidator.ts (unit)", () => {
  let resourceValidator: ResourceValidator;

  let zodSchemaMock: Mocked<ZodMiniObject>;

  beforeEach(() => {
    zodSchemaMock = {
      safeParse: vi.fn().mockReturnValue({
        success: true,
        data: {
          body: {},
          params: {},
          query: {},
        },
      }),
    } as unknown as Mocked<ZodMiniObject>;

    resourceValidator = new ResourceValidator();
  });

  it("validates data correctly", async () => {
    const handler = resourceValidator.setup({ schema: zodSchemaMock });

    const httpRequest = {
      ...mockHttpRequest,
      body: {},
      params: {},
      query: {},
    };

    await handler(httpRequest);

    expect(zodSchemaMock.safeParse).toHaveBeenCalledWith({
      body: httpRequest.body,
      params: httpRequest.params,
      query: httpRequest.query,
    });
  });

  it("returns isOk set to true if validation passes", async () => {
    const handler = resourceValidator.setup({ schema: zodSchemaMock });

    const httpRequest = {
      ...mockHttpRequest,
      body: {},
      params: {},
      query: {},
    };

    const result = await handler(httpRequest);

    expect(result).toEqual({ isOk: true });
  });

  it("throws ValidationException if validation fails", async () => {
    const handler = resourceValidator.setup({ schema: zodSchemaMock });

    zodSchemaMock.safeParse.mockReturnValue({
      success: false,
      error: {
        issues: [],
      },
    } as unknown as any);

    const httpRequest = {
      ...mockHttpRequest,
      body: {},
      params: {},
      query: {},
    };

    await expect(handler(httpRequest)).rejects.toThrow(ValidationException);
  });

  it("formats validation error message correctly", async () => {
    const handler = resourceValidator.setup({ schema: zodSchemaMock });

    const issues = [
      {
        message: "error1",
      },
      {
        message: "error2",
      },
      {
        message: "error3",
      },
    ];

    zodSchemaMock.safeParse.mockReturnValue({
      success: false,
      error: {
        issues,
      },
    } as unknown as any);

    const httpRequest = {
      ...mockHttpRequest,
      body: {},
      params: {},
      query: {},
    };

    await expect(handler(httpRequest)).rejects.toThrow("error1, error2, error3");
  });

  it("assigns validated data to http request if validation passes", async () => {
    zodSchemaMock.safeParse.mockReturnValue({
      success: true,
      data: {
        body: { body: "body" },
        params: { params: "params" },
        query: { query: "query" },
      },
    } as unknown as any);

    const handler = resourceValidator.setup({ schema: zodSchemaMock });

    const httpRequest = {
      ...mockHttpRequest,
      body: {},
      params: {},
      query: {},
    };

    await handler(httpRequest);

    expect(httpRequest.body).toEqual({ body: "body" });
    expect(httpRequest.params).toEqual({ params: "params" });
    expect(httpRequest.query).toEqual({ query: "query" });
  });
});
