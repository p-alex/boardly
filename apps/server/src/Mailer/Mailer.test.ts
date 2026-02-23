import { describe, it, expect, vi, beforeEach } from "vitest";
import nodemailer from "nodemailer";
import Mailer from "./Mailer";
import type { EmailTemplate } from "./emailTemplates/index.js";
import type { MailApi } from "./MailApis/index.js";

vi.mock("nodemailer");

describe("Mailer", () => {
  const sendMailMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (nodemailer.createTransport as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      sendMail: sendMailMock,
    });
  });

  it("creates a transporter using the provided MailApi and sends an email", async () => {
    const mailApi: MailApi = {
      host: "smtp.test.com",
      port: 587,
      secure: false,
      auth: {
        user: "test",
        pass: "password",
      },
    };

    const from = "no-reply@test.com";
    const to = "user@test.com";

    const template: EmailTemplate = {
      subject: "Test subject",
      html: "<p>Hello</p>",
      text: "Hello",
    };

    const mailer = new Mailer(mailApi, from);

    await mailer.send(template, to);

    expect(nodemailer.createTransport).toHaveBeenCalledWith(mailApi);

    expect(sendMailMock).toHaveBeenCalledWith({
      ...template,
      from,
      to,
    });
  });
});
