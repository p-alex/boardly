import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import axios from "axios";
import refreshSessionApi from "./refreshSessionApi";
import { RefreshSessionResponseDto } from "@boardly/shared/dtos/auth";

vi.mock("axios");

const mockedAxios = vi.mocked(axios);

describe("refreshSessionApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls axios with correct URL and credentials", async () => {
    (mockedAxios.get as Mock).mockResolvedValue({
      data: { accessToken: "test-token" },
    });

    await refreshSessionApi();

    expect(mockedAxios.get).toHaveBeenCalledWith(
      import.meta.env.VITE_SERVER_BASE_URL + "/auth/refresh-session",
      { withCredentials: true },
    );
  });

  it("returns response data", async () => {
    const mockData: Partial<RefreshSessionResponseDto> = {
      accessToken: "test-token",
    };

    (mockedAxios.get as Mock).mockResolvedValue({
      data: mockData,
    });

    const result = await refreshSessionApi();

    expect(result).toEqual(mockData);
  });

  it("throws if request fails", async () => {
    (mockedAxios.get as Mock).mockRejectedValue(new Error("Network error"));

    await expect(refreshSessionApi()).rejects.toThrow("Network error");
  });
});
