import { Mock, Mocked, vi } from "vitest";
import { UserFactory } from "../../../domain/UserFactory";
import { UserPasswordAuthFactory } from "../../../domain/UserPasswordAuthFactory";
import { mockUser } from "../../../__fixtures__/user/mockUser";
import { mockUserPasswordAuthMock } from "../../../__fixtures__/userPasswordAuth/mockUserPasswordAuthMock";
import { UserPasswordAuth } from "../../../../generated/prisma_client/client";
import { PrismaTsx } from "..";

describe("UserCreatorService.ts (unit)", () => {
  let userCreatorService: any;
  let userFactoryMock: Mocked<UserFactory>;
  let userPasswordAuthFactoryMock: Mocked<UserPasswordAuthFactory>;

  let tsxPrismaMock: Mocked<PrismaTsx>;

  beforeEach(async () => {
    tsxPrismaMock = {
      user: {
        create: vi.fn().mockResolvedValue(mockUser),
      },
      userPasswordAuth: {
        create: vi.fn().mockResolvedValue(mockUserPasswordAuthMock),
      },
    } as unknown as Mocked<PrismaTsx>;

    vi.doMock("../../../prisma.js", () => ({
      prisma: {
        user: {
          create: vi.fn().mockResolvedValue({ ...mockUser, username: "createdWithPrisma" }),
        },
        userPasswordAuth: {
          create: vi.fn().mockResolvedValue({
            ...mockUserPasswordAuthMock,
            user_id: "createdWithPrisma",
          } as UserPasswordAuth),
        },
      },
    }));

    const { UserCreatorService } = await import("../../services/user/UserCreatorService");

    userFactoryMock = {
      create: vi.fn().mockReturnValue(mockUser),
    } as unknown as Mocked<UserFactory>;

    userPasswordAuthFactoryMock = {
      create: vi.fn().mockReturnValue(mockUserPasswordAuthMock),
    } as unknown as Mocked<UserPasswordAuthFactory>;

    userCreatorService = new UserCreatorService(userFactoryMock, userPasswordAuthFactoryMock);
  });

  it("uses prisma if transaction prisma not provided", async () => {
    const result = await userCreatorService.execute(null, {
      email: "email@email.com",
      password: "password",
      username: "username",
    });

    const expectedResult = {
      createdUser: { ...mockUser, username: "createdWithPrisma" },
      createdUserPasswordAuth: { ...mockUserPasswordAuthMock, user_id: "createdWithPrisma" },
    };

    expect(result).toEqual(expectedResult);
  });

  it("creates user and userPasswordAuth entities correctly", async () => {
    await userCreatorService.execute(tsxPrismaMock, {
      email: "email@email.com",
      password: "password",
      username: "username",
    });

    expect(userFactoryMock.create).toHaveBeenCalledWith({
      username: "username",
      email: "email@email.com",
    });

    expect(userPasswordAuthFactoryMock.create).toHaveBeenCalledWith({
      user_id: mockUser.id,
      password: "password",
    });

    expect(userFactoryMock.create).toHaveBeenCalledTimes(1);
    expect(userPasswordAuthFactoryMock.create).toHaveBeenCalledTimes(1);
  });

  it("inserts new user and userPasswordAuth entities in db  correctly", async () => {
    await userCreatorService.execute(tsxPrismaMock, {
      email: "email@email.com",
      password: "password",
      username: "username",
    });

    expect(tsxPrismaMock.user.create).toHaveBeenCalledWith({ data: mockUser });

    expect(tsxPrismaMock.userPasswordAuth.create).toHaveBeenCalledWith({
      data: mockUserPasswordAuthMock,
    });

    expect(tsxPrismaMock.user.create).toHaveBeenCalledTimes(1);
    expect(tsxPrismaMock.userPasswordAuth.create).toHaveBeenCalledTimes(1);
  });

  it("returns created user and userPasswordAuth entities", async () => {
    const result = await userCreatorService.execute(tsxPrismaMock, {
      email: "email@email.com",
      password: "password",
      username: "username",
    });

    expect(result).toEqual({
      createdUser: mockUser,
      createdUserPasswordAuth: mockUserPasswordAuthMock,
    });
  });

  it("does not create userPasswordAuth if user creation fails", async () => {
    (tsxPrismaMock.user.create as Mock).mockRejectedValueOnce(new Error("DB fail"));

    await expect(
      userCreatorService.execute(tsxPrismaMock, {
        email: "email@email.com",
        password: "password",
        username: "username",
      }),
    ).rejects.toThrow();

    expect(tsxPrismaMock.userPasswordAuth.create).not.toHaveBeenCalled();
  });
});
