// TODO: WRITE THIS TEST FILE

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { screen, waitFor } from "@testing-library/dom";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import VerifiyEmailForm from "./VerifiyEmailForm";
import { Mock, vi } from "vitest";
import verifyEmailApi from "../../../api/verifyEmailApi";
import { AxiosError, AxiosResponse } from "axios";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("../../../api/verifyEmailApi", () => ({ default: vi.fn() }));

async function fillValid() {
  const codeField = screen.getByLabelText(/code/i);

  await userEvent.type(codeField, "123456", { delay: 1 });

  return { codeField };
}

async function fillInvalid() {
  const codeField = screen.getByLabelText(/code/i);

  await userEvent.type(codeField, "1234", { delay: 1 });
}

async function submit() {
  const btn = screen.getByRole("button", { name: /verify email/i });

  await userEvent.click(btn);

  return { btn };
}

function wrapper(props: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <QueryClientProvider client={new QueryClient()}>{props.children}</QueryClientProvider>
    </MemoryRouter>
  );
}

describe("VerifyEmailForm.tsx (unit)", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("blocks user from submitting if form is invalid", async () => {
    render(<VerifiyEmailForm email="email@email.com" />, { wrapper });

    await fillInvalid();

    const { btn } = await submit();

    expect(btn).toBeDisabled();
    expect(verifyEmailApi).not.toHaveBeenCalled();
  });

  it("let's user submit if form is valid", async () => {
    render(<VerifiyEmailForm email="email@email.com" />, { wrapper });

    await fillValid();

    expect(screen.getByRole("button", { name: /verify email/i })).toBeEnabled();

    await submit();

    expect(verifyEmailApi).toHaveBeenCalledWith({ email: "email@email.com", code: "123456" });
  });

  it("displays 'invalid of expired code' error message", async () => {
    (verifyEmailApi as Mock).mockRejectedValue(
      new AxiosError("", "400", undefined, {}, {
        data: { message: "Invalid or expired code" },
      } as AxiosResponse),
    );

    render(<VerifiyEmailForm email="email@email.com" />, { wrapper });

    await fillValid();

    await submit();

    const error = await screen.findByText(/invalid or expired code/i);

    expect(error).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Verify email" })).toBeDisabled();
  });

  it("displays any axios error message at the root of the form", async () => {
    (verifyEmailApi as Mock).mockRejectedValue(
      new AxiosError("", "400", undefined, {}, {
        data: { message: "root error" },
      } as AxiosResponse),
    );

    render(<VerifiyEmailForm email="email@email.com" />, { wrapper });

    await fillValid();

    await submit();

    const error = await screen.findByTestId("rootError");

    expect(error).toBeInTheDocument();
    expect(error).toHaveTextContent("root error");
  });

  it("navigates to /sign-in on successfull submission", async () => {
    render(<VerifiyEmailForm email="email@email.com" />, { wrapper });

    await fillValid();

    await submit();

    expect(navigateMock).toHaveBeenCalledWith("/sign-in");
  });

  it("handles error of any type", async () => {
    (verifyEmailApi as Mock).mockRejectedValue(new Error());

    render(<VerifiyEmailForm email="email@email.com" />, { wrapper });

    await fillValid();

    await submit();
  });

  it("disables submit buttons if form is loading", async () => {
    render(<VerifiyEmailForm email="email@email.com" />, { wrapper });

    await fillValid();

    await submit();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /verify email/i })).toBeDisabled();
    });
  });
});
