import { render, screen } from "@testing-library/react";
import SignInPage from "./SignInPage";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

vi.mock("../api/auth/signInApi", () => ({ default: vi.fn() }));

function wrapper(props: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <QueryClientProvider client={new QueryClient()}>{props.children}</QueryClientProvider>
    </MemoryRouter>
  );
}

describe("SignInPage.tsx (integration)", () => {
  it("should redirect to / if sign in was a success", async () => {
    render(<SignInPage />, { wrapper });

    await userEvent.type(screen.getByLabelText(/email/i), "email@email.com");

    await userEvent.type(screen.getByLabelText(/password/i), "!Password123");

    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(window.location.pathname).toBe("/");
  });
});
