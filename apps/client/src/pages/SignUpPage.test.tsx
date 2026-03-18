import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Mock, vi } from "vitest";
import SignUpPage from "./SignUpPage";
import { createHead, UnheadProvider } from "@unhead/react/client";
import { useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import signUpApi from "../api/auth/signUpApi";

vi.mock("../api/auth/signUpApi", () => ({ default: vi.fn() }));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");

  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

function wrapper(props: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <UnheadProvider head={createHead()}>{props.children}</UnheadProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("SignUpPage.tsx (integration)", () => {
  let navigateMock: Mock;

  beforeEach(() => {
    navigateMock = vi.fn();

    (useNavigate as Mock).mockReturnValue(navigateMock);
  });

  it("should redirect to /verify-email after successfull user registration", async () => {
    (signUpApi as Mock).mockResolvedValue(true);

    render(<SignUpPage />, { wrapper });

    const usernameField = screen.getByLabelText(/username/i);

    const emailField = screen.getByLabelText(/email/i);

    const passwordField = screen.getByLabelText(/^(password)/i);

    const confirmPasswordField = screen.getByLabelText(/confirm password/i);

    await userEvent.type(usernameField, "username", { delay: null });

    await userEvent.type(emailField, "email@email.com", { delay: null });

    await userEvent.type(passwordField, "!Password123", { delay: null });

    await userEvent.type(confirmPasswordField, "!Password123", { delay: null });

    const submitButton = screen.getByRole("button", { name: /create/i });

    await userEvent.click(submitButton);

    expect(navigateMock).toHaveBeenCalledWith("/verify-email", {
      state: { email: "email@email.com" },
    });
  });
});
