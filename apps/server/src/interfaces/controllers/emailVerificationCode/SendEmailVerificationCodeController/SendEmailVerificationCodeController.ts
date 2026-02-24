import { SendEmailVerificationCodeResponseDto } from "@boardly/shared/dtos/emailVerificationCode";
import sendEmailVerificationCodeUsecase, {
  SendEmailVerificationCodeUsecase,
} from "../../../../application/usecases/SendEmailVerificationCodeUsecase/SendEmailVerificationCodeUsecase.js";
import { HttpRequest } from "../../../adapters/index.js";
import { ControllerResponse, IController } from "../../auth/EmailSignUpController/index.js";
import { EmailVerificationDtos } from "@boardly/shared/dtos/";

export class SendEmailVerificationCodeController implements IController {
  constructor(
    private readonly _sendEmailVerificationCodeUsecase: SendEmailVerificationCodeUsecase,
  ) {}

  handle = async (
    httpRequest: HttpRequest<EmailVerificationDtos.SendEmailVerificationCodeRequestDto["body"]>,
  ): Promise<ControllerResponse<SendEmailVerificationCodeResponseDto>> => {
    const email = httpRequest.body.email;

    await this._sendEmailVerificationCodeUsecase.execute({ email });

    return { code: 200, result: null };
  };
}

const sendEmailVerificationCodeController = new SendEmailVerificationCodeController(
  sendEmailVerificationCodeUsecase,
);

export default sendEmailVerificationCodeController;
