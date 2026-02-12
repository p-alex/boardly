import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import SignUpForm from "./SignUpForm";
import userEvent from "@testing-library/user-event";

describe("SignUpForm.tsx", () => {
  it("should submit successfully if form is valid", async () => {
    const signUpRequestMock = vi.fn();

    render(<SignUpForm signUpRequest={signUpRequestMock} />);

    await userEvent.type(screen.getByLabelText(/username/i), "username");
    await userEvent.type(screen.getByLabelText(/email/i), "email@email.com");
    await userEvent.type(screen.getByPlaceholderText(/^(password)/i), "!Password123");
    await userEvent.type(screen.getByLabelText(/confirm password/i), "!Password123");

    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(signUpRequestMock).toHaveBeenCalled();
  });

  it("should block submittion if form is invalid", async () => {
    const signUpRequestMock = vi.fn();

    render(<SignUpForm signUpRequest={signUpRequestMock} />);

    await userEvent.type(screen.getByLabelText(/username/i), "_us_");
    await userEvent.type(screen.getByLabelText(/email/i), "email@email");
    await userEvent.type(screen.getByPlaceholderText(/^(password)/i), "!Pass");
    await userEvent.type(screen.getByLabelText(/confirm password/i), "!Pa");

    const submitBtn = screen.getByRole("button", { name: /create account/i });

    expect(submitBtn).toBeDisabled();
  });

  it("should block submittion if password and confirm password do not match", async () => {
    const signUpRequestMock = vi.fn();

    render(<SignUpForm signUpRequest={signUpRequestMock} />);

    await userEvent.type(screen.getByLabelText(/username/i), "username");
    await userEvent.type(screen.getByLabelText(/email/i), "email@email.com");
    await userEvent.type(screen.getByPlaceholderText(/^(password)/i), "!Password123");
    await userEvent.type(screen.getByLabelText(/confirm password/i), "!Password12");

    const submitBtn = screen.getByRole("button", { name: /create account/i });

    expect(submitBtn).toBeDisabled();
  });
});
