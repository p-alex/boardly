import signUpUsecase, {
  SignUpUsecase,
} from "../../../application/usecases/SignUpUsecase/SignUpUsecase.js";
import { env } from "../../../config.js";
import { HttpRequest } from "../../adapters/index.js";
import { ControllerResponse, IController } from "./index.js";
import { SignUpRequestDtoSchema, SignUpResponseDtoSchema } from "@boardly/shared/dtos/auth";

export class EmailSignUpController implements IController {
  constructor(private readonly _signUpUsecase: SignUpUsecase) {}

  handle = async (
    httpRequest: HttpRequest<SignUpRequestDtoSchema["body"]>,
  ): Promise<ControllerResponse<SignUpResponseDtoSchema>> => {
    const data = httpRequest.body;

    const result = await this._signUpUsecase.execute(data);

    return { code: 201, result, redirect_to: env.CLIENT_BASE_URL + "/verify-email" };
  };
}

const emailSignUpController = new EmailSignUpController(signUpUsecase);

export default emailSignUpController;
