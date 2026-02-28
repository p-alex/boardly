import userFactory, { UserFactory } from "../../../domain/factories/UserFactory.js";
import userPasswordAuthFactory, {
  UserPasswordAuthFactory,
} from "../../../domain/factories/UserPasswordAuthFactory.js";
import { prisma } from "../../../prisma.js";
import { IService, PrismaTsx } from "../index.js";

export class UserCreatorService implements IService {
  constructor(
    private readonly _userFactory: UserFactory,
    private readonly _userPasswordAuthFactory: UserPasswordAuthFactory,
  ) {}

  execute = async (
    tsx: PrismaTsx | null,
    data: { username: string; email: string; password: string },
  ) => {
    const dbClient = tsx ? tsx : prisma;

    const user = this._userFactory.create({
      username: data.username,
      email: data.email,
    });

    const userPasswordAuth = await this._userPasswordAuthFactory.create({
      user_id: user.id,
      password: data.password,
    });

    const createdUser = await dbClient.user.create({ data: user });

    const createdUserPasswordAuth = await dbClient.userPasswordAuth.create({
      data: userPasswordAuth,
    });

    return { createdUser, createdUserPasswordAuth };
  };
}

const userCreatorService = new UserCreatorService(userFactory, userPasswordAuthFactory);

export default userCreatorService;
