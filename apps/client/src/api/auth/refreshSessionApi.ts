import { RefreshSessionResponseDto } from "@boardly/shared/dtos/auth";
import axios, { AxiosResponse } from "axios";

async function refreshSessionApi() {
  const response = await axios.get<any, AxiosResponse<RefreshSessionResponseDto>>(
    import.meta.env.VITE_SERVER_BASE_URL + "/auth/refresh-session",
    { withCredentials: true },
  );

  return response.data;
}

export default refreshSessionApi;
