import { useLocation } from "react-router-dom";
import CenterLayout from "../layouts/CenterLayout";
import FloatingContainer from "../components/FloatingContainer";
import SendEmailVerificationCodeForm from "../components/forms/SendEmailVerificationCodeForm/SendEmailVerificationCodeForm";

function SendEmailVerificationCodePage() {
  const location = useLocation();

  return (
    <CenterLayout>
      <FloatingContainer>
        <SendEmailVerificationCodeForm email={location.state?.email} />
      </FloatingContainer>
    </CenterLayout>
  );
}

export default SendEmailVerificationCodePage;
