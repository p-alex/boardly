import { describe, it, vi, beforeEach, Mock } from "vitest";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createHead, UnheadProvider } from "@unhead/react/client";
import sendEmailVerificationCodeApi from "../api/sendEmailVerificationCodeApi";
import verifyEmailApi from "../api/verifyEmailApi";
import { render, screen } from "@testing-library/react";
import VerifyEmailPage from "./VerifyEmailPage";
import userEvent from "@testing-library/user-event";

vi.mock("../api/sendEmailVerificationCodeApi", () => ({ default: vi.fn() }));
vi.mock("../api/verifyEmailApi", () => ({ default: vi.fn() }));

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
      <QueryClientProvider client={new QueryClient()}>
        <UnheadProvider head={createHead()}>{props.children}</UnheadProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe("VerifyEmailPage.tsx (integration)", () => {
  const mockNavigate = vi.fn();
  const mockLocation = {};

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as unknown as jest.Mock).mockReturnValue(mockNavigate);
    (useLocation as unknown as jest.Mock).mockReturnValue(mockLocation);
  });

  it("shows SEND_VERIFICATION_CODE first by default", () => {
    render(<VerifyEmailPage />, { wrapper });

    const p = screen.getByText(
      "Please provide your account's email address, so we can send a verification code.",
    );

    expect(p).toBeInTheDocument();
  });

  it("moves to EMAIL_VERIFICATION step if SEND_VERIFICATION_CODE step was a success", async () => {
    (sendEmailVerificationCodeApi as Mock).mockResolvedValue(true);

    render(<VerifyEmailPage />, { wrapper });

    const emailField = screen.getByLabelText(/email/i);

    await userEvent.type(emailField, "email@email.com", { delay: null });

    const sendCodeButton = screen.getByRole("button", { name: /send/i });

    await userEvent.click(sendCodeButton);

    expect(sendEmailVerificationCodeApi).toHaveBeenCalledWith({
      email: "email@email.com",
      code_type: "EMAIL_VERIFICATION",
    });

    const secondStage = screen.getByText(
      "A verification code has been sent. It will expire in 10 minutes. Please check your inbox.",
    );

    expect(secondStage).toBeInTheDocument();
  });

  it("does not move to EMAIL_VERIFICATION step if SEND_VERIFICATION_CODE fails", async () => {
    (sendEmailVerificationCodeApi as Mock).mockRejectedValue(false);

    render(<VerifyEmailPage />, { wrapper });

    const emailField = screen.getByLabelText(/email/i);

    await userEvent.type(emailField, "email@email.com", { delay: null });

    const sendCodeButton = screen.getByRole("button", { name: /send/i });

    await userEvent.click(sendCodeButton);

    const firstStep = screen.getByText(
      "Please provide your account's email address, so we can send a verification code.",
    );

    const secondStep = screen.queryByText(
      "A verification code has been sent. It will expire in 10 minutes. Please check your inbox.",
    );

    expect(firstStep).toBeInTheDocument();
    expect(secondStep).not.toBeInTheDocument();
  });

  it("automatically populates email field in SEND_VERIFICATION_CODE step, if email is present in location state", () => {
    (useLocation as Mock).mockReturnValue({ state: { email: "email@email.com" } });

    render(<VerifyEmailPage />, { wrapper });

    const emailField = screen.getByLabelText(/email/i);

    expect(emailField).toHaveValue("email@email.com");
  });

  it("navigates to /sign-in upon successfull email verification", async () => {
    (useLocation as Mock).mockReturnValue({ state: { test: "test" } });

    (sendEmailVerificationCodeApi as Mock).mockResolvedValue(true);
    (verifyEmailApi as Mock).mockResolvedValue(true);

    render(<VerifyEmailPage />, { wrapper });

    const emailField = screen.getByLabelText(/email/i);

    await userEvent.type(emailField, "email@email.com", { delay: null });

    const sendCodeButton = screen.getByRole("button", { name: /send/i });

    await userEvent.click(sendCodeButton);

    const codeField = screen.getByLabelText(/code/i);

    await userEvent.type(codeField, "123456", { delay: null });

    const verifyButton = screen.getByRole("button", { name: /verify/i });

    await userEvent.click(verifyButton);

    expect(verifyEmailApi).toHaveBeenCalledWith({
      email: "email@email.com",
      code: "123456",
      code_type: "EMAIL_VERIFICATION",
    });

    expect(useNavigate()).toHaveBeenCalledWith("/sign-in");
  });
});
