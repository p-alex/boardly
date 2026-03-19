import { render, screen } from "@testing-library/react";
import { AuthContextProvider, useAuthContext } from "./AuthContextProvider";
import userEvent from "@testing-library/user-event";

function TestComponent() {
  const authContext = useAuthContext();

  return (
    <div>
      <p>{authContext.authData.user.id}</p>
      <p>{authContext.authData.user.username}</p>
      <p>{authContext.authData.accessToken}</p>
      <p>{JSON.stringify(authContext.isRefreshing)}</p>
      <button
        onClick={() =>
          authContext.login({
            user: { id: "id", username: "username" },
            accessToken: "accessToken",
          })
        }
      >
        login
      </button>
      <button onClick={authContext.logout}>logout</button>
      <button onClick={authContext.toggleIsRefreshing}>toggle refreshing</button>
    </div>
  );
}

function wrapper(props: { children: React.ReactNode }) {
  return <AuthContextProvider>{props.children}</AuthContextProvider>;
}

describe("AuthContextProvider.tsx (unit)", () => {
  it("logs the user in", async () => {
    render(<TestComponent />, { wrapper });

    const loginButton = screen.getByRole("button", { name: /login/i });

    await userEvent.click(loginButton);

    expect(screen.getByText("id")).toBeInTheDocument();
    expect(screen.getByText("username")).toBeInTheDocument();
    expect(screen.getByText("accessToken")).toBeInTheDocument();
  });

  it("logs out the user", async () => {
    render(<TestComponent />, { wrapper });

    const loginButton = screen.getByRole("button", { name: /login/i });

    await userEvent.click(loginButton);

    const logoutButton = screen.getByRole("button", { name: /logout/i });

    await userEvent.click(logoutButton);

    expect(screen.queryByText("id")).not.toBeInTheDocument();
    expect(screen.queryByText("username")).not.toBeInTheDocument();
    expect(screen.queryByText("accessToken")).not.toBeInTheDocument();
  });

  it("throws Error if the component is not wrapped inside AuthContextProvider", () => {
    expect(() => render(<TestComponent />)).toThrow("No auth context.");
  });

  it("toggles is refreshing", async () => {
    render(<TestComponent />, { wrapper });

    const refreshToggle = screen.getByRole("button", { name: /toggle refreshing/i });

    await userEvent.click(refreshToggle);

    expect(screen.getByText("true")).toBeInTheDocument();

    await userEvent.click(refreshToggle);

    expect(screen.getByText("false")).toBeInTheDocument();
  });

  it("should not log user in while refreshing", async () => {
    render(<TestComponent />, { wrapper });

    const refreshToggle = screen.getByRole("button", { name: /toggle refreshing/i });

    await userEvent.click(refreshToggle);

    const loginButton = screen.getByRole("button", { name: /login/i });

    await userEvent.click(loginButton);

    expect(screen.queryByText("id")).not.toBeInTheDocument();
    expect(screen.queryByText("username")).not.toBeInTheDocument();
    expect(screen.queryByText("accessToken")).not.toBeInTheDocument();
  });
});
