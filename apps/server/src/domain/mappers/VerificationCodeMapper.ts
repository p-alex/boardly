import { verificationCodeFieldValidations } from "@boardly/shared/fieldValidations";
import { VerificationCodeType } from "../../application/services/verificationCode/index.js";

export class VerificationCodeMapper {
  private readonly _map: Record<
    verificationCodeFieldValidations.VerificationCodeType,
    VerificationCodeType
  >;
  constructor() {
    this._map = { EMAIL_VERIFICATION: "emailVerificationCode" };
  }

  map = (
    codeTypeDto: verificationCodeFieldValidations.VerificationCodeType,
  ): VerificationCodeType => {
    return this._map[codeTypeDto];
  };
}

const verificationCodeMapper = new VerificationCodeMapper();

export default verificationCodeMapper;
