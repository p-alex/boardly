import getVerificationCodeEmailTemplate from "./getVerificationCodeEmailTemplate";

describe("getVerificationCodeEmailTemplate.ts", () => {
  it("should apply correct subject for EMAIL_VERIFICATION template", () => {
    const result = getVerificationCodeEmailTemplate("123456", "EMAIL_VERIFICATION");

    expect(result.subject).toBe("Verify your email address");
  });

  it("content should contain the correct action for EMAIL_VERIFICATION template", () => {
    const result = getVerificationCodeEmailTemplate("123456", "EMAIL_VERIFICATION");

    expect(result.html).toContain("confirm your email address");
  });

  it("should return correctly", () => {
    const result = getVerificationCodeEmailTemplate("123456", "EMAIL_VERIFICATION");

    expect(result).toMatchObject({
      subject: expect.any(String),
      text: expect.any(String),
      html: expect.any(String),
    });
  });

  it("should contain the verification code", () => {
    const result = getVerificationCodeEmailTemplate("123456", "EMAIL_VERIFICATION");

    expect(result.text).toContain("123456");
    expect(result.html).toContain("123456");
  });
});
