import {
  SendEmailVerificationCodeRequestDto,
  SendEmailVerificationCodeResponseDto,
} from "@boardly/shared/dtos/emailVerificationCode";
import axios, { AxiosResponse } from "axios";

async function sendEmailVerificationCodeApi(data: { email: string }) {
  const response = await axios.post<
    any,
    AxiosResponse<SendEmailVerificationCodeResponseDto>,
    SendEmailVerificationCodeRequestDto["body"]
  >(import.meta.env.VITE_SERVER_BASE_URL + "/auth/send-email-verification-code", data);

  return response.data;
}

export default sendEmailVerificationCodeApi;
