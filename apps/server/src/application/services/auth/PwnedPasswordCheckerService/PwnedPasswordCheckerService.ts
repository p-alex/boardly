import { cryptoUtil, CryptoUtil } from "@boardly/shared/utils";
import axios from "axios";
import { pwnedPasswordsResponseDtoSchema } from "../../../../infrastructure/dtos/pwnedPasswordsResponseDto.schema.js";

export interface PwnedPasswordCheckerService {
  execute: (data: { password: string }) => Promise<boolean>;
}

export class PwnedPasswordCheckerServiceImpl implements PwnedPasswordCheckerService {
  constructor(
    private readonly _pwnedPasswordsResponseDtoSchema: typeof pwnedPasswordsResponseDtoSchema,
    private readonly _cryptoUtil: CryptoUtil,
  ) {}

  execute = async (data: { password: string }): Promise<boolean> => {
    const sha1 = this._cryptoUtil.sha1(data.password).toUpperCase();

    const prefix = sha1.slice(0, 5);

    const suffix = sha1.slice(5);

    const url = "https://api.pwnedpasswords.com/range/" + prefix;

    const response = await axios.get<string>(url);

    const parsed = this._pwnedPasswordsResponseDtoSchema.safeParse(response.data.trim());

    if (!parsed.success) throw new Error("Pwned passwords response is not supported.");

    return parsed.data.split(/\r?\n/).some((line) => line.startsWith(suffix));
  };
}

const pwnedPasswordCheckerService = new PwnedPasswordCheckerServiceImpl(
  pwnedPasswordsResponseDtoSchema,
  cryptoUtil,
);

export default pwnedPasswordCheckerService;
