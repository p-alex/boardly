import { cryptoUtil, CryptoUtil } from "@boardly/shared/utils";
import { env } from "../../../config.js";

export class VerificationCodeHashValidator {
  constructor(private crypto: CryptoUtil) {}

  isValid = (data: {
    code_hash: string;
    code_raw: string;
    code_type: keyof typeof env.HASH_SECRETS.VERIFICATION_CODES;
  }) => {
    const hash = this.crypto.hmacSHA256(
      data.code_raw,
      env.HASH_SECRETS.VERIFICATION_CODES[data.code_type],
    );

    return data.code_hash === hash;
  };
}

const verificationCodeHashValidator = new VerificationCodeHashValidator(cryptoUtil);

export default verificationCodeHashValidator;
