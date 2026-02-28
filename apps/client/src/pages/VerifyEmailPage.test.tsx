import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import VerifyEmailPage from "./VerifyEmailPage";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
    useLocation: vi.fn(),
  };
});

function wrapper(props: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <QueryClientProvider client={new QueryClient()}>{props.children}</QueryClientProvider>
    </MemoryRouter>
  );
}

describe("VerifyEmailPage", () => {
  const mockNavigate = vi.fn();
  const mockLocation = { state: { email: "test@example.com" } };

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as unknown as jest.Mock).mockReturnValue(mockNavigate);
    (useLocation as unknown as jest.Mock).mockReturnValue(mockLocation);
  });

  it("redirects if email is missing in location state", () => {
    (useLocation as unknown as jest.Mock).mockReturnValue({ state: {} });

    render(<VerifyEmailPage />, { wrapper });

    expect(screen.queryByLabelText(/code/i)).not.toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith("/send-email-verification-code");
  });
});
