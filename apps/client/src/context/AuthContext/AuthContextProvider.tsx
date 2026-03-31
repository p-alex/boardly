import { createContext, useContext, useState } from "react";

export interface IAuthContext {
  authData: AuthData;
  login: (data: { user: { id: string; username: string }; accessToken: string }) => void;
  logout: () => void;
}

export const AuthContext = createContext<IAuthContext | undefined>(undefined);

type AuthData = {
  user: { id: string; username: string };
  accessToken: string;
};

const initialAuthData: AuthData = {
  user: { id: "", username: "" },
  accessToken: "",
};

export function AuthContextProvider(props: { children: React.ReactNode }) {
  const [authData, setAuthData] = useState<AuthData>(initialAuthData);

  const login = (data: { user: AuthData["user"]; accessToken: string }) => {
    setAuthData(data);
  };

  const logout = () => setAuthData(initialAuthData);

  return (
    <AuthContext.Provider value={{ authData, login, logout }}>
      {props.children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("No auth context.");
  return context;
}
