import { useRef } from "react";
import SendVerificationCodeForm from "../components/forms/SendVerificationCodeForm/SendVerificationCodeForm";
import MultiStep from "../components/MultiStep";
import CenterLayout from "../layouts/CenterLayout";
import { verificationCodeFieldValidations } from "@boardly/shared/fieldValidations";
import VerifiyEmailForm from "../components/forms/VerifyEmailForm/VerifiyEmailForm";
import { useLocation, useNavigate } from "react-router-dom";
import { useHead } from "@unhead/react";
import LargeLogo from "../components/LargeLogo";
import ReCaptchaFormMessage from "../components/ReCaptchaFormMessage";
import msToMinutes from "../utils/msToMinutes";
import { verificationCodeConstants } from "@boardly/shared/constants";

function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const emailRef = useRef<string | null>(null);
  const codeTypeRef = useRef<verificationCodeFieldValidations.VerificationCodeType | null>(null);

  useHead({
    title: "Verify your email | Boardly",
  });

  return (
    <CenterLayout>
      <section className="flex flex-col text-center w-full max-w-85">
        <div className="mb-12 flex flex-col gap-2">
          <LargeLogo />
          <h1 className="text-2xl font-bold text-text">Email verification</h1>
        </div>
        <MultiStep
          steps={[
            {
              name: "SEND_VERIFICATION_CODE",
              render: ({ next }) => (
                <div className="flex flex-col gap-6">
                  <p className="text-textMuted">
                    Please provide your account's email address, so we can send a verification code.
                  </p>
                  <SendVerificationCodeForm
                    email={location.state?.email}
                    code_type="EMAIL_VERIFICATION"
                    onSuccess={({ emailUsed, code_type }) => {
                      emailRef.current = emailUsed;
                      codeTypeRef.current = code_type;
                      next();
                    }}
                  />
                  <ReCaptchaFormMessage />
                </div>
              ),
            },
            {
              name: "VERIFY_CODE",
              render: () => (
                <div className="flex flex-col gap-6">
                  <p className="text-textMuted">
                    {`A verification code has been sent. It will expire in ${msToMinutes(verificationCodeConstants.EXPIRES_AFTER_MS)} minutes. Please check
                    your inbox.`}
                  </p>
                  <VerifiyEmailForm
                    email={emailRef.current!}
                    code_type={codeTypeRef.current!}
                    onSuccess={() => navigate("/sign-in")}
                  />
                  <ReCaptchaFormMessage />
                </div>
              ),
            },
          ]}
        />
      </section>
    </CenterLayout>
  );
}

export default VerifyEmailPage;
