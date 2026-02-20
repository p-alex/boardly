import { PrismaClient } from "../../../../generated/prisma_client/client.js";
import AlreadyExistsException from "../../../exceptions/AlreadyExistsException.js";
import { prisma } from "../../../prisma.js";
import userCreatorService, { UserCreatorService } from "../../services/user/UserCreatorService.js";
import userEmailFinderService, {
  UserEmailFinderService,
} from "../../services/user/UserEmailFinderService.js";
import userEmailRotationService, {
  UserEmailRotationService,
} from "../../services/user/UserEmailRotationService.js";
import { IUsecase } from "../index.js";

export class SignUpUsecase implements IUsecase {
  constructor(
    private readonly _userCreatorService: UserCreatorService,
    private readonly _userEmailFinderService: UserEmailFinderService,
    private readonly _userEmailRotationService: UserEmailRotationService,
    private readonly _prisma: PrismaClient,
  ) {}

  execute = async (data: { username: string; email: string; password: string }) => {
    return await this._prisma.$transaction(async (tsx) => {
      const userWithUsername = await tsx.user.findUnique({ where: { username: data.username } });

      if (userWithUsername)
        throw new AlreadyExistsException("A user with that username already exists.");

      let userWithEmail = await this._userEmailFinderService.execute(tsx, {
        email: data.email,
      });

      if (userWithEmail?.user && userWithEmail.foundWithInactiveSecret) {
        userWithEmail.user = await this._userEmailRotationService.execute(null, {
          email: data.email,
          userId: userWithEmail.user.id,
        });
      }

      if (userWithEmail?.user)
        throw new AlreadyExistsException("A user with that email already exists.");

      await this._userCreatorService.execute(tsx, data);

      return null;
    });
  };
}

const signUpUsecase = new SignUpUsecase(
  userCreatorService,
  userEmailFinderService,
  userEmailRotationService,
  prisma,
);

export default signUpUsecase;
