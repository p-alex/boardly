import { render } from "@testing-library/react";
import RefreshAuthWrapper from "./RefreshAuthWrapper";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContextProvider, useAuthContext } from "../context/AuthContext/AuthContextProvider";
import { vi } from "vitest";
import refreshSessionApi from "../api/auth/refreshSessionApi";

vi.mock("../api/auth/refreshSessionApi", () => ({
  default: vi
    .fn()
    .mockResolvedValue({ user: { id: "id", username: "username" }, accessToken: "accessToken" }),
}));

function wrapper(props: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <AuthContextProvider>
        <RefreshAuthWrapper />
        {props.children}
      </AuthContextProvider>
    </QueryClientProvider>
  );
}

function TestComponent() {
  const authContext = useAuthContext();

  return (
    <div>
      <p>{authContext.authData.user.id}</p>
      <p>{authContext.authData.user.username}</p>
      <p>{authContext.authData.accessToken}</p>
    </div>
  );
}

describe("RefreshAuthWrapper.tsx (unit)", () => {
  it("refreshes session on load", async () => {
    render(<TestComponent />, { wrapper });

    expect(refreshSessionApi).toHaveBeenCalled();
  });
});
