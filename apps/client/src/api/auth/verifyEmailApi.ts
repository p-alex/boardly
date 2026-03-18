import { VerifyEmailRequestDto, VerifyEmailResponseDto } from "@boardly/shared/dtos/auth";
import { verificationCodeFieldValidations } from "@boardly/shared/fieldValidations";
import axios, { AxiosResponse } from "axios";

export type VerifyEmailApiData = {
  code: string;
  email: string;
  code_type: verificationCodeFieldValidations.VerificationCodeType;
};

async function verifyEmailApi(data: VerifyEmailApiData) {
  const response = await axios.post<
    any,
    AxiosResponse<VerifyEmailResponseDto>,
    VerifyEmailRequestDto["body"]
  >(import.meta.env.VITE_SERVER_BASE_URL + "/auth/verify-email", data);

  return response;
}

export default verifyEmailApi;
