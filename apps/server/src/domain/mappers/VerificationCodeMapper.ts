import { verificationCodeFieldValidations } from "@boardly/shared/fieldValidations";
import { VerificationCode } from "../../../generated/prisma_client/client.js";

export class VerificationCodeTypeMapper {
  private readonly _map: Record<
    verificationCodeFieldValidations.VerificationCodeType,
    VerificationCode["type"]
  >;
  constructor() {
    this._map = { EMAIL_VERIFICATION: "EMAIL_VERIFICATION" };
  }

  map = (
    codeTypeDto: verificationCodeFieldValidations.VerificationCodeType,
  ): VerificationCode["type"] => {
    return this._map[codeTypeDto];
  };
}

const verificationCodeTypeMapper = new VerificationCodeTypeMapper();

export default verificationCodeTypeMapper;
