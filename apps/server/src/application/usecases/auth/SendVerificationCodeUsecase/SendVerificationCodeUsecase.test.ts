import { Mock, Mocked, vi } from "vitest";

import { PrismaClient } from "../../../../../generated/prisma_client/client";
import { SendVerificationCodeUsecase } from "./SendVerificationCodeUsecase";
import { UserEmailFinderService } from "../../../services/user/UserEmailFinderService";
import { CreateVerificationCodeService } from "../../../services/verificationCode/CreateVerificationCodeService";
import { VerificationCodeTypeMapper } from "../../../../domain/mappers/VerificationCodeMapper";
import { RefreshVerificationCodeService } from "../../../services/verificationCode/RefreshVerificationCodeService";
import { SendVerificationCodeEmailService } from "../../../services/verificationCode/SendVerificationCodeEmailService";
import { PrismaTsx } from "../../../services";
import { userFixtures, verificationCodeFixtures } from "../../../../__fixtures__";

describe("SendVerificationCodeUsecase.ts (unit)", () => {
  let prismaTsxMock: Mocked<PrismaTsx>;
  let prismaMock: Mocked<PrismaClient>;
  let userEmailFinderService: Mocked<UserEmailFinderService>;
  let createVerificationCodeService: Mocked<CreateVerificationCodeService>;
  let verificationCodeTypeMapper: Mocked<VerificationCodeTypeMapper>;
  let refreshVerificationCodeService: Mocked<RefreshVerificationCodeService>;
  let sendVerificationCodeEmailService: Mocked<SendVerificationCodeEmailService>;
  let shouldSendBasedOnCodeType: Mock;

  let sendVerificationCodeUsecase: SendVerificationCodeUsecase;

  beforeEach(() => {
    prismaTsxMock = {
      verificationCode: {
        findFirst: vi.fn(),
      },
    } as unknown as Mocked<PrismaTsx>;

    prismaMock = {
      $transaction: vi.fn((cb) => cb(prismaTsxMock)),
    } as unknown as Mocked<PrismaClient>;

    userEmailFinderService = {
      execute: vi.fn(),
    } as unknown as Mocked<UserEmailFinderService>;

    createVerificationCodeService = {
      execute: vi.fn(),
    } as unknown as Mocked<CreateVerificationCodeService>;

    verificationCodeTypeMapper = {
      map: vi.fn().mockReturnValue("mapped code_type"),
    } as unknown as Mocked<VerificationCodeTypeMapper>;

    refreshVerificationCodeService = {
      execute: vi.fn(),
    } as unknown as Mocked<RefreshVerificationCodeService>;

    sendVerificationCodeEmailService = {
      execute: vi.fn(),
    } as unknown as Mocked<SendVerificationCodeEmailService>;

    shouldSendBasedOnCodeType = vi.fn();

    sendVerificationCodeUsecase = new SendVerificationCodeUsecase(
      prismaMock,
      userEmailFinderService,
      createVerificationCodeService,
      verificationCodeTypeMapper,
      refreshVerificationCodeService,
      sendVerificationCodeEmailService,
      shouldSendBasedOnCodeType,
    );
  });

  it("should not send verification code email if user does not exist and return false", async () => {
    userEmailFinderService.execute.mockResolvedValue({
      user: null,
      foundWithInactiveSecret: false,
    });

    const result = await sendVerificationCodeUsecase.execute({
      email: "email@email.com",
      code_type: "EMAIL_VERIFICATION",
    });

    expect(userEmailFinderService.execute).toHaveBeenCalledWith(prismaTsxMock, {
      email: "email@email.com",
    });

    expect(sendVerificationCodeEmailService.execute).not.toHaveBeenCalled();

    expect(result).toEqual({
      success: false,
      can_resend_at_timestamp: undefined,
    });
  });

  it("should not send verification code if it cannot be sent based on code type", async () => {
    userEmailFinderService.execute.mockResolvedValue({
      user: userFixtures.mockUser,
      foundWithInactiveSecret: false,
    });

    shouldSendBasedOnCodeType.mockReturnValue(false);

    const result = await sendVerificationCodeUsecase.execute({
      code_type: "EMAIL_VERIFICATION",
      email: "email@email.com",
    });

    expect(shouldSendBasedOnCodeType).toHaveBeenCalledWith({
      code_type: "mapped code_type",
      user: userFixtures.mockUser,
    });

    expect(sendVerificationCodeEmailService.execute).not.toHaveBeenCalled();

    expect(result).toEqual({
      success: false,
      can_resend_at_timestamp: undefined,
    });
  });

  it("should refresh the verification code if there is one active already, and send it", async () => {
    userEmailFinderService.execute.mockResolvedValue({
      user: userFixtures.mockUser,
      foundWithInactiveSecret: false,
    });

    shouldSendBasedOnCodeType.mockReturnValue(true);

    (prismaTsxMock.verificationCode.findFirst as Mock).mockResolvedValue(
      verificationCodeFixtures.verificationCodeMock,
    );

    refreshVerificationCodeService.execute.mockResolvedValue({
      rawCode: "111111",
      refreshedVerificationCode: verificationCodeFixtures.verificationCodeMock,
    });

    const result = await sendVerificationCodeUsecase.execute({
      email: "email@email.com",
      code_type: "EMAIL_VERIFICATION",
    });

    expect(verificationCodeTypeMapper.map).toHaveBeenCalledWith("EMAIL_VERIFICATION");

    expect(prismaTsxMock.verificationCode.findFirst).toHaveBeenCalledWith({
      where: { user_id: userFixtures.mockUser.id, type: "mapped code_type" },
    });

    expect(refreshVerificationCodeService.execute).toHaveBeenCalledWith(prismaTsxMock, {
      user_id: userFixtures.mockUser.id,
      verificationCode: verificationCodeFixtures.verificationCodeMock,
    });

    expect(sendVerificationCodeEmailService.execute).toHaveBeenCalledWith({
      code_type: "EMAIL_VERIFICATION",
      rawCode: "111111",
      toEmail: "email@email.com",
    });

    expect(result).toEqual({
      success: true,
      can_resend_at_timestamp:
        verificationCodeFixtures.verificationCodeMock.can_resend_at.getTime(),
    });
  });

  it("should create a new verification code with a mapped code type if there is no active one, and send it", async () => {
    userEmailFinderService.execute.mockResolvedValue({
      user: userFixtures.mockUser,
      foundWithInactiveSecret: false,
    });

    shouldSendBasedOnCodeType.mockReturnValue(true);

    (prismaTsxMock.verificationCode.findFirst as Mock).mockResolvedValue(null);

    createVerificationCodeService.execute.mockResolvedValue({
      rawCode: "111111",
      verificationCode: verificationCodeFixtures.verificationCodeMock,
    });

    const result = await sendVerificationCodeUsecase.execute({
      email: "email@email.com",
      code_type: "EMAIL_VERIFICATION",
    });

    expect(verificationCodeTypeMapper.map).toHaveBeenCalledWith("EMAIL_VERIFICATION");

    expect(refreshVerificationCodeService.execute).not.toHaveBeenCalled();

    expect(createVerificationCodeService.execute).toHaveBeenCalledWith(prismaTsxMock, {
      user_id: userFixtures.mockUser.id,
      code_type: "mapped code_type",
    });

    expect(sendVerificationCodeEmailService.execute).toHaveBeenCalledWith({
      code_type: "EMAIL_VERIFICATION",
      rawCode: "111111",
      toEmail: "email@email.com",
    });

    expect(result).toEqual({
      success: true,
      can_resend_at_timestamp:
        verificationCodeFixtures.verificationCodeMock.can_resend_at.getTime(),
    });
  });

  it("should not send verification code if verification code refresh fails", async () => {
    userEmailFinderService.execute.mockResolvedValue({
      user: userFixtures.mockUser,
      foundWithInactiveSecret: false,
    });

    shouldSendBasedOnCodeType.mockReturnValue(true);

    (prismaTsxMock.verificationCode.findFirst as Mock).mockResolvedValue(
      verificationCodeFixtures.verificationCodeMock,
    );

    refreshVerificationCodeService.execute.mockRejectedValue(new Error("error"));

    await expect(
      sendVerificationCodeUsecase.execute({
        code_type: "EMAIL_VERIFICATION",
        email: "email@email.com",
      }),
    ).rejects.toThrow("error");

    expect(sendVerificationCodeEmailService.execute).not.toHaveBeenCalled();
  });
});
