import { vi } from "vitest";
import { render } from "@testing-library/react";
import RedirectIfSignedInWrapper from "./RedirectIfSignedInWrapper";
import { MemoryRouter } from "react-router-dom";

const { authContextMock } = vi.hoisted(() => ({
  authContextMock: vi.fn(),
}));

vi.mock("../context/AuthContext/AuthContextProvider", () => ({
  useAuthContext: authContextMock,
}));

const navigateMock = vi.fn();

vi.mock(import("react-router-dom"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: vi.fn(() => navigateMock),
  };
});

function wrapper(props: { children: React.ReactNode }) {
  return <MemoryRouter>{props.children}</MemoryRouter>;
}

describe("RedirectIfSignInWrapper.tsx (unit)", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("redirects if signed in to specified path", () => {
    authContextMock.mockReturnValue({
      authData: {
        user: { id: "id", username: "username" },
        accessToken: "token",
      },
    });

    render(<RedirectIfSignedInWrapper to="/home"></RedirectIfSignedInWrapper>, { wrapper });

    expect(navigateMock).toHaveBeenCalledWith("/home", { replace: true });
  });

  it("does not redirect if not signed in to specified path", () => {
    authContextMock.mockReturnValue({
      authData: {
        user: { id: "id", username: "username" },
        accessToken: "",
      },
    });

    render(<RedirectIfSignedInWrapper to="/home"></RedirectIfSignedInWrapper>, { wrapper });

    expect(navigateMock).not.toHaveBeenCalled();
  });
});
