import signUpUsecase, {
  PasswordSignUpUsecase,
} from "../../../../application/usecases/user/PasswordSignUpUsecase/PasswordSignUpUsecase.js";
import { HttpRequest } from "../../../adapters/index.js";
import { ControllerResponse, IController } from "./index.js";
import { SignUpRequestDtoSchema, SignUpResponseDtoSchema } from "@boardly/shared/dtos/auth";

export class PasswordSignUpController implements IController {
  constructor(private readonly _passwordSignUpUsecase: PasswordSignUpUsecase) {}

  handle = async (
    httpRequest: HttpRequest<SignUpRequestDtoSchema["body"]>,
  ): Promise<ControllerResponse<SignUpResponseDtoSchema>> => {
    const data = httpRequest.body;

    await this._passwordSignUpUsecase.execute(data);

    return { code: 201, result: null };
  };
}

const passwordSignUpController = new PasswordSignUpController(signUpUsecase);

export default passwordSignUpController;
