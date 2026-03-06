import { VerificationCode } from "../../../generated/prisma_client/client.js";
import { EmailTemplate } from "./index.js";

const getVerificationCodeEmailTemplate = (
  code: string,
  code_type: VerificationCode["type"],
): EmailTemplate => {
  const codeTypeToContent: Record<VerificationCode["type"], { subject: string; action: string }> = {
    EMAIL_VERIFICATION: {
      subject: "Verify your email address",
      action: "confirm your email address",
    },
  };

  return {
    subject: codeTypeToContent[code_type].subject,
    text: `Your verification code is: ${code}`,
    html: `
      <div style="
        background-color: #f4f6f8;
        padding: 40px 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      ">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="
                background: #ffffff;
                border-radius: 12px;
                padding: 32px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.05);
              ">
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <h1 style="
                      margin: 0;
                      font-size: 24px;
                      color: #111827;
                    ">Verify your email</h1>
                  </td>
                </tr>

                <tr>
                  <td style="
                    font-size: 16px;
                    color: #374151;
                    line-height: 1.6;
                    padding-bottom: 24px;
                  ">
                    Hi,<br /><br />
                    Please use the verification code below to ${codeTypeToContent[code_type].action}:
                  </td>
                </tr>

                <tr>
                  <td align="center" style="padding-bottom: 32px;">
                    <div style="
                      display: inline-block;
                      background: #111827;
                      color: #ffffff;
                      font-size: 28px;
                      font-weight: 700;
                      letter-spacing: 6px;
                      padding: 14px 28px;
                      border-radius: 10px;
                    ">
                      ${code}
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="
                    font-size: 14px;
                    color: #6b7280;
                    line-height: 1.6;
                    padding-bottom: 24px;
                  ">
                    This code will expire in 10 minutes. If you did not request this,
                    you can safely ignore this email.
                  </td>
                </tr>

                <tr>
                  <td style="
                    border-top: 1px solid #e5e7eb;
                    padding-top: 16px;
                    font-size: 12px;
                    color: #9ca3af;
                    text-align: center;
                  ">
                    © ${new Date().getFullYear()} Boardly. All rights reserved.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    `,
  };
};

export type GetVerificationTemplate = typeof getVerificationCodeEmailTemplate;

export default getVerificationCodeEmailTemplate;
