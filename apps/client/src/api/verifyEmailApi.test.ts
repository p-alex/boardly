import { describe, it, expect, vi, beforeEach } from "vitest";
import verifyEmailApi, { VerifyEmailApiData } from "./verifyEmailApi";
import axios, { AxiosResponse } from "axios";
import type { VerifyEmailResponseDto } from "@boardly/shared/dtos/auth";

vi.mock("axios");

describe("verifyEmailApi", () => {
  const mockedAxiosPost = axios.post as unknown as jest.Mock;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls axios.post with correct URL and data and returns response", async () => {
    const data: VerifyEmailApiData = {
      email: "test@example.com",
      code: "123456",
      code_type: "EMAIL_VERIFICATION",
    };

    const mockResponse: Partial<AxiosResponse<VerifyEmailResponseDto>> = {
      data: { success: true },
      status: 200,
      statusText: "OK",
      headers: {},
    };

    mockedAxiosPost.mockResolvedValue(mockResponse);

    const response = await verifyEmailApi(data);

    expect(mockedAxiosPost).toHaveBeenCalledWith(
      import.meta.env.VITE_SERVER_BASE_URL + "/auth/verify-email",
      data,
    );
    expect(response).toBe(mockResponse);
  });

  it("propagates errors thrown by axios.post", async () => {
    const data: VerifyEmailApiData = {
      email: "test@example.com",
      code: "123456",
      code_type: "EMAIL_VERIFICATION",
    };
    const error = new Error("Network Error");
    mockedAxiosPost.mockRejectedValue(error);

    await expect(verifyEmailApi(data)).rejects.toThrow("Network Error");
  });
});
