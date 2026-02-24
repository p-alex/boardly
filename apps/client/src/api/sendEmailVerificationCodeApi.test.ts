import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import axios from "axios";
import sendEmailVerificationCodeApi from "./sendEmailVerificationCodeApi";
import type { SendEmailVerificationCodeResponseDto } from "@boardly/shared/dtos/emailVerificationCode";

vi.mock("axios");

describe("sendEmailVerificationCodeApi", () => {
  const mockedAxios = axios as unknown as {
    post: Mock;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls axios.post with the correct URL and data", async () => {
    const fakeResponse: SendEmailVerificationCodeResponseDto = null;
    mockedAxios.post.mockResolvedValue({ data: fakeResponse });

    const data = { email: "test@example.com" };
    await sendEmailVerificationCodeApi(data);

    expect(mockedAxios.post).toHaveBeenCalledOnce();
    expect(mockedAxios.post).toHaveBeenCalledWith(
      import.meta.env.VITE_SERVER_BASE_URL + "/auth/send-email-verification-code",
      data,
    );
  });

  it("returns the response data", async () => {
    const fakeResponse: SendEmailVerificationCodeResponseDto = null;
    mockedAxios.post.mockResolvedValue({ data: fakeResponse });

    const result = await sendEmailVerificationCodeApi({ email: "test@example.com" });

    expect(result).toEqual(fakeResponse);
  });

  it("throws an error if axios.post rejects", async () => {
    const error = new Error("Network error");
    mockedAxios.post.mockRejectedValue(error);

    await expect(sendEmailVerificationCodeApi({ email: "fail@example.com" })).rejects.toThrow(
      "Network error",
    );
  });
});
