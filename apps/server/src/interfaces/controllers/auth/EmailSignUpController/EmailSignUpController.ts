import signUpUsecase, {
  SignUpUsecase,
} from "../../../../application/usecases/SignUpUsecase/SignUpUsecase.js";
import { HttpRequest } from "../../../adapters/index.js";
import { ControllerResponse, IController } from "./index.js";
import { SignUpRequestDtoSchema, SignUpResponseDtoSchema } from "@boardly/shared/dtos/auth";

export class EmailSignUpController implements IController {
  constructor(private readonly _signUpUsecase: SignUpUsecase) {}

  handle = async (
    httpRequest: HttpRequest<SignUpRequestDtoSchema["body"]>,
  ): Promise<ControllerResponse<SignUpResponseDtoSchema>> => {
    const data = httpRequest.body;

    await this._signUpUsecase.execute(data);

    return { code: 201, result: null };
  };
}

const emailSignUpController = new EmailSignUpController(signUpUsecase);

export default emailSignUpController;
