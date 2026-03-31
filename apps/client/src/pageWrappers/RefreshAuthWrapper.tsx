import { useQuery } from "@tanstack/react-query";
import refreshSessionApi from "../api/auth/refreshSessionApi";
import { useAuthContext } from "../context/AuthContext/AuthContextProvider";
import { Outlet } from "react-router-dom";

function RefreshAuthWrapper() {
  const authContext = useAuthContext();

  useQuery({
    queryKey: ["refresh-session"],
    queryFn: async () => {
      const result = await refreshSessionApi();
      authContext.login({ user: result.user, accessToken: result.accessToken });
      return result;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  return <Outlet />;
}

export default RefreshAuthWrapper;
