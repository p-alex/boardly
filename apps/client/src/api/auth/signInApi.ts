import {
  PasswordSignInDtoRequestSchema,
  PasswordSignInDtoResponseSchema,
} from "@boardly/shared/dtos/auth";
import axios, { AxiosResponse } from "axios";

async function signInApi(data: { email: string; password: string }) {
  const response = await axios.post<
    any,
    AxiosResponse<PasswordSignInDtoResponseSchema>,
    PasswordSignInDtoRequestSchema["body"]
  >(import.meta.env.VITE_SERVER_BASE_URL + "/auth/password-sign-in", data, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return response.data;
}

export default signInApi;
