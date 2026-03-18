import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import axios from "axios";
import signInApi from "./signInApi";

vi.mock("axios");

describe("signInApi", () => {
  const mockedAxios = vi.mocked(axios);

  const mockResponse = {
    data: {
      accessToken: "test-token",
      user: { id: "1", email: "test@example.com" },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call axios.post with correct arguments", async () => {
    (mockedAxios.post as Mock).mockResolvedValueOnce(mockResponse as any);

    const input = {
      email: "test@example.com",
      password: "password123",
    };

    await signInApi(input);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      import.meta.env.VITE_SERVER_BASE_URL + "/auth/password-sign-in",
      input,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      },
    );
  });

  it("should return response data", async () => {
    (mockedAxios.post as Mock).mockResolvedValueOnce(mockResponse as any);

    const result = await signInApi({
      email: "test@example.com",
      password: "password123",
    });

    expect(result).toEqual(mockResponse.data);
  });

  it("should throw if request fails", async () => {
    (mockedAxios.post as Mock).mockRejectedValueOnce(new Error("Network Error"));

    await expect(signInApi({ email: "test@example.com", password: "wrong" })).rejects.toThrow(
      "Network Error",
    );
  });
});
