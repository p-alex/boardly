import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import axios from "axios";
import sendEmailVerificationCodeApi from "./sendEmailVerificationCodeApi";
import type { SendVerificationCodeResponseDto } from "@boardly/shared/dtos/verificationCode";
import { SendVerificationCodeFormSchema } from "../components/forms/SendVerificationCodeForm/SendVerificationCodeForm.schema";

vi.mock("axios");

describe("sendEmailVerificationCodeApi", () => {
  const mockedAxios = axios as unknown as {
    post: Mock;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls axios.post with the correct URL and data", async () => {
    const fakeResponse: SendVerificationCodeResponseDto = null;
    mockedAxios.post.mockResolvedValue({ data: fakeResponse });

    const data = {
      email: "test@example.com",
      code_type: "EMAIL_VERIFICATION",
    } as SendVerificationCodeFormSchema;
    await sendEmailVerificationCodeApi(data);

    expect(mockedAxios.post).toHaveBeenCalledOnce();
    expect(mockedAxios.post).toHaveBeenCalledWith(
      import.meta.env.VITE_SERVER_BASE_URL + "/auth/send-email-verification-code",
      data,
    );
  });

  it("returns the response data", async () => {
    const fakeResponse: SendVerificationCodeResponseDto = null;
    mockedAxios.post.mockResolvedValue({ data: fakeResponse });

    const result = await sendEmailVerificationCodeApi({
      email: "test@example.com",
      code_type: "EMAIL_VERIFICATION",
    });

    expect(result).toEqual(fakeResponse);
  });

  it("throws an error if axios.post rejects", async () => {
    const error = new Error("Network error");
    mockedAxios.post.mockRejectedValue(error);

    await expect(
      sendEmailVerificationCodeApi({ email: "fail@example.com", code_type: "EMAIL_VERIFICATION" }),
    ).rejects.toThrow("Network error");
  });
});
