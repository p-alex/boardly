import { useEffect } from "react";
import FloatingContainer from "../components/FloatingContainer";
import CenterLayout from "../layouts/CenterLayout";
import { useNavigate, useLocation } from "react-router-dom";
import VerifiyEmailForm from "../components/forms/VerifyEmailForm/VerifiyEmailForm";

function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.state?.email) navigate("/send-email-verification-code");
  }, []);

  if (!location.state?.email) return null;

  return (
    <CenterLayout>
      <FloatingContainer>
        <VerifiyEmailForm email={location.state?.email} />
      </FloatingContainer>
    </CenterLayout>
  );
}

export default VerifyEmailPage;
