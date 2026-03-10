import { vi } from "vitest";
import getNewVerificationCodeResendAtDate from "./getNewVerificationCodeResendAtDate";
import { verificationCodeConstants } from "@boardly/shared/constants";

describe("getNewVerificationCodeResendAtDate.ts", () => {
  it("returns correctly", () => {
    vi.spyOn(Date, "now").mockReturnValue(1000);

    const result = getNewVerificationCodeResendAtDate({ resend_count: 5 });

    expect(result.getTime()).toBe(
      new Date(
        1000 + verificationCodeConstants.BASE_CAN_RESEND_AFTER_MS + 1000 * 60 * 2 * 5,
      ).getTime(),
    );
  });
});
