import { SendVerificationCodeResponseDto } from "@boardly/shared/dtos/verificationCode";
import sendEmailVerificationCodeUsecase, {
  SendVerificationCodeUsecase,
} from "../../../../application/usecases/auth/SendVerificationCodeUsecase/SendVerificationCodeUsecase.js";
import { HttpRequest } from "../../../adapters/index.js";
import { ControllerResponse, IController } from "../../auth/PasswordSignUpController/index.js";
import { VerificationDtos } from "@boardly/shared/dtos/";

export class SendVerificationCodeController implements IController {
  constructor(private readonly _sendVerificationCodeUsecase: SendVerificationCodeUsecase) {}

  handle = async (
    httpRequest: HttpRequest<VerificationDtos.SendVerificationCodeRequestDto["body"]>,
  ): Promise<ControllerResponse<SendVerificationCodeResponseDto>> => {
    const { code_type, email } = httpRequest.body;

    const { can_resend_at_timestamp } = await this._sendVerificationCodeUsecase.execute({
      email,
      code_type,
    });

    return { code: 200, result: { can_resend_at_timestamp } };
  };
}

const sendverificationCodeController = new SendVerificationCodeController(
  sendEmailVerificationCodeUsecase,
);

export default sendverificationCodeController;
