import { VerifyEmailRequestDto, VerifyEmailResponseDto } from "@boardly/shared/dtos/auth";
import verifyEmailUsecase, {
  VerifyEmailUsecase,
} from "../../../../application/usecases/VerifyEmailUsecase/VerifyEmailUsecase.js";
import { HttpRequest } from "../../../adapters/index.js";
import { ControllerResponse, IController } from "../EmailSignUpController/index.js";

export class VerifiyEmailController implements IController {
  constructor(private readonly _verifyEmailUsecase: VerifyEmailUsecase) {}

  handle = async (
    httpRequest: HttpRequest<VerifyEmailRequestDto["body"]>,
  ): Promise<ControllerResponse<VerifyEmailResponseDto>> => {
    const { code, email } = httpRequest.body;
    await this._verifyEmailUsecase.execute({ code, email });
    return { result: { success: true }, code: 200 };
  };
}

const verifiyEmailController = new VerifiyEmailController(verifyEmailUsecase);

export default verifiyEmailController;
