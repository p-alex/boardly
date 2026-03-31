import { useEffect } from "react";
import { useAuthContext } from "../context/AuthContext/AuthContextProvider";
import { Outlet, useNavigate } from "react-router-dom";

interface Props {
  to: string;
}

function RedirectIfSignedInWrapper(props: Props) {
  const navigate = useNavigate();

  const authContext = useAuthContext();

  const isSignedIn = authContext.authData.accessToken;

  useEffect(() => {
    if (isSignedIn) navigate(props.to, { replace: true });
  }, [isSignedIn]);

  return !isSignedIn ? <Outlet /> : null;
}

export default RedirectIfSignedInWrapper;
