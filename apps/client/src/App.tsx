import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const SignInPage = lazy(() => import("./pages/SignInPage"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage"));
const HomePage = lazy(() => import("./pages/HomePage"));

function App() {
  return (
    <Routes>
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/sign-in" replace />} />
    </Routes>
  );
}

export default App;
