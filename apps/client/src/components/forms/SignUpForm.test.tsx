import { render, screen } from "@testing-library/react";
import { Mock, vi } from "vitest";
import SignUpForm from "./SignUpForm";
import userEvent from "@testing-library/user-event";

import signUpApi from "../../api/signUpApi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ServerErrorResponseDto } from "@boardly/shared/dtos/server";
import { AxiosError } from "axios";
import { MemoryRouter } from "react-router-dom";

vi.mock("../../api/signUpApi", () => ({ default: vi.fn().mockResolvedValue(null) }));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </MemoryRouter>
    );
  };
}

async function fillFormWithValidData() {
  const usernameField = screen.getByLabelText(/username/i);
  const emailField = screen.getByLabelText(/email/i);
  const passwordField = screen.getByPlaceholderText(/^(password)/i);
  const confirmPasswordField = screen.getByLabelText(/confirm password/i);

  await userEvent.type(usernameField, "username", {
    delay: 1,
  });

  await userEvent.type(emailField, "email@email.com", {
    delay: null,
  });

  await userEvent.type(passwordField, "!Password123", {
    delay: null,
  });

  await userEvent.type(confirmPasswordField, "!Password123", {
    delay: null,
  });

  return { usernameField, emailField, passwordField, confirmPasswordField };
}

async function fillFormWithInvalidData() {
  await userEvent.type(screen.getByLabelText(/username/i), "_us_", {
    delay: null,
  });

  await userEvent.type(screen.getByLabelText(/email/i), "email@email", {
    delay: null,
  });

  await userEvent.type(screen.getByPlaceholderText(/^(password)/i), "!Pass", {
    delay: null,
  });

  await userEvent.type(screen.getByLabelText(/confirm password/i), "!Pa", {
    delay: null,
  });
}

describe("SignUpForm.tsx", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should submit successfully if form is valid", async () => {
    render(<SignUpForm />, { wrapper: createWrapper() });

    await fillFormWithValidData();

    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(signUpApi).toHaveBeenCalled();
  });

  it("should block submission if form is invalid", async () => {
    render(<SignUpForm />, { wrapper: createWrapper() });

    await fillFormWithInvalidData();

    const submitBtn = screen.getByRole("button", { name: /create account/i });

    expect(submitBtn).toBeDisabled();
  });

  it("enables form submittion if form is valid", async () => {
    render(<SignUpForm />, { wrapper: createWrapper() });

    await fillFormWithValidData();

    const submitBtn = screen.getByRole("button", { name: /create account/i });

    expect(submitBtn).not.toBeDisabled();

    await userEvent.click(submitBtn);

    expect(signUpApi).toHaveBeenCalledWith({
      username: "username",
      email: "email@email.com",
      password: "!Password123",
    });
  });

  it("should display the correct error message if the username is taken", async () => {
    const serverError: ServerErrorResponseDto = {
      status: 400,
      message: "A user with that username already exists.",
    };

    const axiosError = { ...new AxiosError(), response: { data: serverError } };

    (signUpApi as Mock).mockRejectedValue(axiosError);

    render(<SignUpForm />, { wrapper: createWrapper() });

    const { usernameField } = await fillFormWithValidData();

    const submitBtn = screen.getByRole("button", { name: /create account/i });

    await userEvent.click(submitBtn);

    const errorMessage = await screen.findByText(serverError.message);

    expect(usernameField).toBeInvalid();
    expect(errorMessage).toBeInTheDocument();
  });

  it("should display the correct error message if the email is taken", async () => {
    const serverError: ServerErrorResponseDto = {
      status: 400,
      message: "A user with that email already exists.",
    };

    const axiosError = { ...new AxiosError(), response: { data: serverError } };

    (signUpApi as Mock).mockRejectedValue(axiosError);

    render(<SignUpForm />, { wrapper: createWrapper() });

    const { emailField } = await fillFormWithValidData();

    const submitBtn = screen.getByRole("button", { name: /create account/i });

    await userEvent.click(submitBtn);

    const errorMessage = await screen.findByText(serverError.message);

    expect(emailField).toBeInvalid();
    expect(errorMessage).toBeInTheDocument();
  });

  it("should display the correct error message if the password was found in a data breech", async () => {
    const serverError: ServerErrorResponseDto = {
      status: 400,
      message:
        "Password has been found in a data breech and it's not safe to use. Please try another one.",
    };

    const axiosError = { ...new AxiosError(), response: { data: serverError } };

    (signUpApi as Mock).mockRejectedValue(axiosError);

    render(<SignUpForm />, { wrapper: createWrapper() });

    const { passwordField } = await fillFormWithValidData();

    const submitBtn = screen.getByRole("button", { name: /create account/i });

    await userEvent.click(submitBtn);

    const errorMessage = await screen.findByText(serverError.message);

    expect(passwordField).toBeInvalid();
    expect(errorMessage).toBeInTheDocument();
  });

  it("should display error message to the root of the form for any other axios error", async () => {
    const serverError: ServerErrorResponseDto = {
      status: 400,
      message: "Random error",
    };

    const axiosError = { ...new AxiosError(), response: { data: serverError } };

    (signUpApi as Mock).mockRejectedValue(axiosError);

    render(<SignUpForm />, { wrapper: createWrapper() });

    await fillFormWithValidData();

    const submitBtn = screen.getByRole("button", { name: /create account/i });

    await userEvent.click(submitBtn);

    const errorMessage = await screen.findByTestId("rootError");

    expect(errorMessage).toBeInTheDocument();
  });

  it("should handle errors other then axios errors correctly", async () => {
    (signUpApi as Mock).mockRejectedValue(new Error("random error"));

    render(<SignUpForm />, { wrapper: createWrapper() });

    await fillFormWithValidData();

    const submitBtn = screen.getByRole("button", { name: /create account/i });

    await userEvent.click(submitBtn);
  });
});
