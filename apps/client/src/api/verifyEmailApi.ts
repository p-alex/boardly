import { VerifyEmailRequestDto, VerifyEmailResponseDto } from "@boardly/shared/dtos/auth";
import axios, { AxiosResponse } from "axios";

async function verifyEmailApi(data: { code: string; email: string }) {
  const response = await axios.post<
    any,
    AxiosResponse<VerifyEmailResponseDto>,
    VerifyEmailRequestDto["body"]
  >(import.meta.env.VITE_SERVER_BASE_URL + "/auth/verify-email", data);

  return response;
}

export default verifyEmailApi;
