import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import signUpApi from "./signUpApi";

vi.mock("axios");

const mockedAxios = axios as unknown as {
  post: ReturnType<typeof vi.fn>;
};

describe("signUpApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls axios.post with correct url and payload", async () => {
    const mockResponse = { data: { success: true } };
    mockedAxios.post = vi.fn().mockResolvedValue(mockResponse);

    const data = {
      username: "test",
      email: "test@test.com",
      password: "123456",
    };

    await signUpApi(data);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      import.meta.env.VITE_SERVER_BASE_URL + "/auth/password-sign-up",
      data,
    );
  });

  it("returns response.data", async () => {
    const mockResponse = { data: { token: "abc123" } };
    mockedAxios.post = vi.fn().mockResolvedValue(mockResponse);

    const result = await signUpApi({
      username: "test",
      email: "test@test.com",
      password: "123456",
    });

    expect(result).toEqual(mockResponse.data);
  });

  it("throws if axios throws", async () => {
    mockedAxios.post = vi.fn().mockRejectedValue(new Error("Network error"));

    await expect(
      signUpApi({
        username: "test",
        email: "test@test.com",
        password: "123456",
      }),
    ).rejects.toThrow("Network error");
  });
});
