import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import SendEmailVerificationCodePage from "./pages/SendEmailVerificationCodePage";

const SignUpPage = lazy(() => import("./pages/SignUpPage"));

function App() {
  return (
    <Routes>
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/send-email-verification-code" element={<SendEmailVerificationCodePage />} />
      <Route path="/verify-email" element={<p>Verify email page</p>} />
      <Route path="*" element={<Navigate to="/sign-up" replace />} />
    </Routes>
  );
}

export default App;
