import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import RedirectIfSignedInWrapper from "./pageWrappers/RedirectIfSignedInWrapper";
import RefreshAuthWrapper from "./pageWrappers/RefreshAuthWrapper";
import ProtectedRoutesWrapper from "./pageWrappers/ProtectedRoutesWrapper";

const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const SignInPage = lazy(() => import("./pages/SignInPage"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage"));
const HomePage = lazy(() => import("./pages/HomePage"));

function App() {
  return (
    <Routes>
      <Route element={<RefreshAuthWrapper />}>
        <Route element={<RedirectIfSignedInWrapper to="/" />}>
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/sign-in" element={<SignInPage />} />
        </Route>
        <Route element={<ProtectedRoutesWrapper />}>
          <Route path="/" element={<HomePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/sign-in" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
