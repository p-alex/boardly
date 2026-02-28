import { screen } from "@testing-library/dom";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import sendEmailVerificationCodeApi from "../../../api/sendEmailVerificationCodeApi";
import { Mock, vi } from "vitest";
import { AxiosError } from "axios";
import { ServerErrorResponseDto } from "@boardly/shared/dtos/server";

vi.mock("../../../api/sendEmailVerificationCodeApi", () => ({ default: vi.fn() }));

import SendEmailVerificationCodeForm from "./SendEmailVerificationCodeForm";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

async function fillValid() {
  const emailField = screen.getByLabelText(/email/i);
  await userEvent.type(emailField, "email@email.com", { delay: 1 });
  return { emailField };
}

async function fillInvalid() {
  const emailField = screen.getByLabelText(/email/i);
  await userEvent.type(emailField, "email", { delay: 1 });
}

async function submitForm() {
  const submitBtn = screen.getByRole("button", { name: /send verification code/i });

  await userEvent.click(submitBtn);
}

function makeWrapper() {
  const queryClient = new QueryClient();

  return (props: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{props.children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe("SendEmailVerificationCodeForm.tsx", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("prevents user from submitting if form is invalid", async () => {
    render(<SendEmailVerificationCodeForm />, { wrapper: makeWrapper() });

    await fillInvalid();

    const submitBtn = screen.getByRole("button", { name: "Send verification code" });

    expect(submitBtn).toBeDisabled();
  });

  it("automatically fills email field with the email prop value if passsed", () => {
    render(<SendEmailVerificationCodeForm email="email@email.com" />, { wrapper: makeWrapper() });

    const emailField = screen.getByRole("textbox");

    expect(emailField).toHaveValue("email@email.com");
  });

  it("displays error message if a user with that email does not exist", async () => {
    const errorMessage = "A user with that email does not exist.";

    const serverError: ServerErrorResponseDto = {
      status: 400,
      message: errorMessage,
    };

    const axiosError = { ...new AxiosError(), response: { data: serverError } };

    (sendEmailVerificationCodeApi as Mock).mockRejectedValue(axiosError);

    render(<SendEmailVerificationCodeForm />, { wrapper: makeWrapper() });

    const { emailField } = await fillValid();

    await submitForm();

    expect(sendEmailVerificationCodeApi).toHaveBeenCalledWith({ email: "email@email.com" });

    expect(emailField).toBeInvalid();

    const error = await screen.findByText(errorMessage);

    expect(error).toBeInTheDocument();
  });

  it("displays error at the root of the form if the email is already verified", async () => {
    const errorMessage = "This email is already verified.";

    const serverError: ServerErrorResponseDto = {
      status: 400,
      message: errorMessage,
    };

    const axiosError = { ...new AxiosError(), response: { data: serverError } };

    (sendEmailVerificationCodeApi as Mock).mockRejectedValue(axiosError);

    render(<SendEmailVerificationCodeForm />, { wrapper: makeWrapper() });

    await fillValid();

    await submitForm();

    const rootError = await screen.findByTestId("rootError");

    expect(rootError).toHaveTextContent(errorMessage);
  });

  it("displays any other error at the root of the form", async () => {
    const errorMessage = "any error";

    const serverError: ServerErrorResponseDto = {
      status: 400,
      message: errorMessage,
    };

    const axiosError = { ...new AxiosError(), response: { data: serverError } };

    (sendEmailVerificationCodeApi as Mock).mockRejectedValue(axiosError);

    render(<SendEmailVerificationCodeForm />, { wrapper: makeWrapper() });

    await fillValid();

    await submitForm();

    const rootError = await screen.findByTestId("rootError");

    expect(rootError).toHaveTextContent(errorMessage);
  });

  it("redirects user to /verify-email if the submission was successfull", async () => {
    render(<SendEmailVerificationCodeForm />, { wrapper: makeWrapper() });

    await fillValid();

    await submitForm();

    expect(navigateMock).toHaveBeenCalledWith("/verify-email", {
      state: { email: "email@email.com" },
    });
  });

  it("should handle errors other then axios errors correctly", async () => {
    (sendEmailVerificationCodeApi as Mock).mockRejectedValue(new Error("random error"));

    render(<SendEmailVerificationCodeForm />, { wrapper: makeWrapper() });

    await fillValid();

    await submitForm();
  });
});
