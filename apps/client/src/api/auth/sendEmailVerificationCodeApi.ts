import {
  SendVerificationCodeRequestDto,
  SendVerificationCodeResponseDto,
} from "@boardly/shared/dtos/verificationCode";
import axios, { AxiosResponse } from "axios";
import { verificationCodeFieldValidations } from "@boardly/shared/fieldValidations";

async function sendEmailVerificationCodeApi(data: {
  email: string;
  code_type: verificationCodeFieldValidations.VerificationCodeType;
}) {
  const response = await axios.post<
    any,
    AxiosResponse<SendVerificationCodeResponseDto>,
    SendVerificationCodeRequestDto["body"]
  >(import.meta.env.VITE_SERVER_BASE_URL + "/auth/send-verification-code", data);

  return response.data;
}

export default sendEmailVerificationCodeApi;
