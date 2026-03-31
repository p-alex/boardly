import { useEffect } from "react";
import { useAuthContext } from "../context/AuthContext/AuthContextProvider";
import { Outlet, useNavigate } from "react-router-dom";

function ProtectedRoutesWrapper() {
  const navigate = useNavigate();

  const authContext = useAuthContext();

  const isSignedIn = authContext.authData.accessToken !== "";

  useEffect(() => {
    if (!isSignedIn) navigate("/sign-in", { replace: true });
  }, [isSignedIn]);

  return isSignedIn ? <Outlet /> : null;
}

export default ProtectedRoutesWrapper;
