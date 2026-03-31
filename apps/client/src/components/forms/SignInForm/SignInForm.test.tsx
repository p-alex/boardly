import { render, screen } from "@testing-library/react";
import SignInForm from "./SignInForm";
import userEvent from "@testing-library/user-event";
import { Mock, vi } from "vitest";
import signInApi from "../../../api/auth/signInApi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { ServerErrorResponseDto } from "@boardly/shared/dtos/server";
import {
  AuthContextProvider,
  useAuthContext,
} from "../../../context/AuthContext/AuthContextProvider";
import { PasswordSignInDtoResponseSchema } from "@boardly/shared/dtos/auth";

vi.mock("../../../api/auth/signInApi", () => ({ default: vi.fn() }));

vi.mock(import("../../../context/AuthContext/AuthContextProvider"), async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useAuthContext: vi.fn() };
});

function wrapper(props: { children: React.ReactNode }) {
  return (
    <AuthContextProvider>
      <QueryClientProvider client={new QueryClient()}>{props.children}</QueryClientProvider>
    </AuthContextProvider>
  );
}

describe("SignInForm.tsx (unit)", () => {
  it("should not submit form if it is invalid", async () => {
    render(<SignInForm />, { wrapper });

    await userEvent.type(screen.getByLabelText(/email/i), "emai", { delay: null });

    await userEvent.type(screen.getByLabelText(/password/i), "p", { delay: null });

    await userEvent.click(screen.getByRole("button", { name: "Sign In" }), { delay: null });

    expect(signInApi).not.toHaveBeenCalled();
  });

  it("should not allow typing more characters than the max password length inside the password field", async () => {
    render(<SignInForm />, { wrapper });

    await userEvent.type(
      screen.getByLabelText(/password/i),
      "opwiserbnorfgbndfognhbifdnjgjfdbgndfkjbnhjdfgnbkjlfdjnsogifdgfdkngkjdfnbjkldfsbnifdsjgoireoignoreg",
      { delay: null },
    );

    expect(screen.getByLabelText(/password/i)).toHaveValue(
      "opwiserbnorfgbndfognhbifdnjgjfdbgndfkjbnhjdfgnbkjlfdjnsogifdgfdk",
    );
  });

  it("submit button should be disabled if form is not valid", () => {
    render(<SignInForm />, { wrapper });

    const submitBtn = screen.getByRole("button", { name: "Sign In" });

    expect(submitBtn).toBeDisabled();
  });

  it("submit button should be enabled as soon as the form is valid", async () => {
    render(<SignInForm />, { wrapper });

    const submitBtn = screen.getByRole("button", { name: "Sign In" });

    expect(submitBtn).toBeDisabled();

    await userEvent.type(screen.getByLabelText(/email/i), "email@email.com", { delay: null });

    await userEvent.type(screen.getByLabelText(/password/i), "!Password123", { delay: null });

    expect(submitBtn).not.toBeDisabled();
  });

  it("should display error messages to the root of the form", async () => {
    (signInApi as Mock).mockRejectedValue(
      new AxiosError("error", "1", {} as any, undefined, {
        data: { message: "ERROR", status: 400 } as ServerErrorResponseDto,
      } as AxiosResponse),
    );

    render(<SignInForm />, { wrapper });

    await userEvent.type(screen.getByLabelText(/email/i), "email@email.com", { delay: null });

    await userEvent.type(screen.getByLabelText(/password/i), "!Password123", { delay: null });

    const submitBtn = screen.getByRole("button", { name: "Sign In" });

    await userEvent.click(submitBtn);

    expect(screen.getByTestId("rootError")).toHaveTextContent("ERROR");
  });

  it("dislays generic error message if the mutation throws and error of a type other than axios error", async () => {
    (signInApi as Mock).mockRejectedValue(new Error("other error"));

    render(<SignInForm />, { wrapper });

    await userEvent.type(screen.getByLabelText(/email/i), "email@email.com", { delay: null });

    await userEvent.type(screen.getByLabelText(/password/i), "!Password123", { delay: null });

    const submitBtn = screen.getByRole("button", { name: "Sign In" });

    await userEvent.click(submitBtn);

    expect(screen.getByTestId("rootError")).toHaveTextContent(
      "Something went wrong. Please try again later.",
    );
  });

  it("should log in user on success", async () => {
    const loginMock = vi.fn();

    (signInApi as Mock).mockResolvedValue({
      auth: { id: "id", username: "username", accessToken: "accessToken" },
      redirectTo: undefined,
    } as PasswordSignInDtoResponseSchema);

    (useAuthContext as Mock).mockReturnValue({
      login: loginMock,
    });

    render(<SignInForm />, { wrapper });

    await userEvent.type(screen.getByLabelText(/email/i), "email@email.com", { delay: null });

    await userEvent.type(screen.getByLabelText(/password/i), "!Password123", { delay: null });

    const submitBtn = screen.getByRole("button", { name: "Sign In" });

    await userEvent.click(submitBtn);

    expect(loginMock).toHaveBeenCalled();
  });
});
