import { SignUpRequestDtoSchema, SignUpResponseDtoSchema } from "@boardly/shared/dtos/auth";
import axios, { AxiosResponse } from "axios";

export type SignUpData = { username: string; email: string; password: string };

async function signUpApi(data: SignUpData) {
  const response = await axios.post<
    any,
    AxiosResponse<SignUpResponseDtoSchema>,
    SignUpRequestDtoSchema["body"]
  >(import.meta.env.VITE_SERVER_BASE_URL + "/auth/password-sign-up", data);

  return response.data;
}

export default signUpApi;
