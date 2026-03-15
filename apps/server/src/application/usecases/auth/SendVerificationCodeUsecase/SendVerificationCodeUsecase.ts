import { IUsecase } from "../../index.js";
import { prisma } from "../../../../prisma.js";
import createVerificationCodeService, {
  CreateVerificationCodeService,
} from "../../../services/verificationCode/CreateVerificationCodeService.js";
import { PrismaClient, VerificationCode } from "../../../../../generated/prisma_client/client.js";
import userEmailFinderService, {
  UserEmailFinderService,
} from "../../../services/user/UserEmailFinderService.js";
import { verificationCodeFieldValidations } from "@boardly/shared/fieldValidations";
import verificationCodeMapper, {
  VerificationCodeTypeMapper,
} from "../../../../domain/mappers/VerificationCodeMapper.js";
import refreshVerificationCodeService, {
  RefreshVerificationCodeService,
} from "../../../services/verificationCode/RefreshVerificationCodeService.js";
import sendVerificationCodeEmailService, {
  SendVerificationCodeEmailService,
} from "../../../services/verificationCode/SendVerificationCodeEmailService.js";
import shouldSendVerificationCodeBasedOnType from "../../../../domain/services/verificationCode/shouldSendVerificationCodeBasedOnType.js";

export class SendVerificationCodeUsecase implements IUsecase {
  constructor(
    private readonly _prisma: PrismaClient,
    private readonly _userEmailFinderService: UserEmailFinderService,
    private readonly _createVerificationCodeService: CreateVerificationCodeService,
    private readonly _verificationCodeTypeMapper: VerificationCodeTypeMapper,
    private readonly _refreshVerificationCodeService: RefreshVerificationCodeService,
    private readonly _sendVerificationCodeEmailService: SendVerificationCodeEmailService,
    private readonly _shouldSendVerificationCodeBasedOnType: typeof shouldSendVerificationCodeBasedOnType,
  ) {}

  execute = async (data: {
    email: string;
    code_type: verificationCodeFieldValidations.VerificationCodeType;
  }) => {
    const { success, rawCode, code_type, can_resend_at_timestamp } =
      await this._prisma.$transaction(
        async (
          tsx,
        ): Promise<{
          success: boolean;
          rawCode?: string;
          code_type?: VerificationCode["type"];
          can_resend_at_timestamp?: number;
        }> => {
          const { user } = await this._userEmailFinderService.execute(tsx, { email: data.email });

          if (!user) return { success: false };

          const codeType = this._verificationCodeTypeMapper.map(data.code_type);

          const shouldSendBasedOnCodeType = this._shouldSendVerificationCodeBasedOnType({
            code_type: codeType,
            user,
          });
          if (!shouldSendBasedOnCodeType) return { success: false };

          const activeCode = await tsx.verificationCode.findFirst({
            where: { user_id: user.id, type: codeType },
          });

          if (activeCode) {
            const refreshResult = await this._refreshVerificationCodeService.execute(tsx, {
              user_id: user.id,
              verificationCode: activeCode,
            });

            return {
              success: true,
              rawCode: refreshResult.rawCode,
              code_type: activeCode.type,
              can_resend_at_timestamp:
                refreshResult.refreshedVerificationCode.can_resend_at.getTime(),
            };
          }

          const { rawCode, verificationCode } = await this._createVerificationCodeService.execute(
            tsx,
            {
              user_id: user.id,
              code_type: codeType,
            },
          );

          return {
            success: true,
            rawCode,
            code_type: verificationCode.type,
            can_resend_at_timestamp: verificationCode.can_resend_at.getTime(),
          };
        },
      );

    if (success && code_type && rawCode)
      await this._sendVerificationCodeEmailService.execute({
        code_type,
        rawCode,
        toEmail: data.email,
      });

    return { success, can_resend_at_timestamp: can_resend_at_timestamp! };
  };
}

const sendVerificationCodeUsecase = new SendVerificationCodeUsecase(
  prisma,
  userEmailFinderService,
  createVerificationCodeService,
  verificationCodeMapper,
  refreshVerificationCodeService,
  sendVerificationCodeEmailService,
  shouldSendVerificationCodeBasedOnType,
);

export default sendVerificationCodeUsecase;
