import { useLocation } from "react-router-dom";
import CenterLayout from "../layouts/CenterLayout";
import FloatingContainer from "../components/FloatingContainer";
import SendVerificationCodeForm from "../components/forms/SendVerificationCodeForm/SendVerificationCodeForm";

function SendEmailVerificationCodePage() {
  const location = useLocation();

  return (
    <CenterLayout>
      <FloatingContainer>
        <SendVerificationCodeForm
          email={location.state?.email}
          code_type="EMAIL_VERIFICATION"
          description="You need to verify your email to be able to sign in"
        />
      </FloatingContainer>
    </CenterLayout>
  );
}

export default SendEmailVerificationCodePage;
