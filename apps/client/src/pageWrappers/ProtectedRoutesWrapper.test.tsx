import { vi } from "vitest";
import ProtectedRoutesWrapper from "./ProtectedRoutesWrapper";
import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";

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

describe("ProtectedRoutesWrapper.tsx (unit)", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("redirects to /sign-in if not signed in", () => {
    authContextMock.mockReturnValue({
      authData: {
        user: { id: "id", username: "username" },
        accessToken: "",
      },
    });

    render(<ProtectedRoutesWrapper></ProtectedRoutesWrapper>, { wrapper });

    expect(navigateMock).toHaveBeenCalledWith("/sign-in", { replace: true });
  });

  it("does not redirect to /sign-in if signed in", () => {
    authContextMock.mockReturnValue({
      authData: {
        user: { id: "id", username: "username" },
        accessToken: "accessToken",
      },
    });

    render(<ProtectedRoutesWrapper></ProtectedRoutesWrapper>, { wrapper });

    expect(navigateMock).not.toHaveBeenCalled();
  });
});
