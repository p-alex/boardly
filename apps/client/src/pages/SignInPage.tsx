import { Link } from "react-router-dom";
import LargeLogo from "../components/LargeLogo";
import ReCaptchaFormMessage from "../components/ReCaptchaFormMessage";
import CenterLayout from "../layouts/CenterLayout";
import SignInForm from "../components/forms/SignInForm/SignInForm";

function SignInPage() {
  return (
    <CenterLayout>
      <section className="flex flex-col text-center w-full max-w-85">
        <div className="mb-12 flex flex-col gap-2">
          <LargeLogo />
          <h1 className="text-2xl font-bold text-text">Sign In</h1>
        </div>
        <div className="mb-4">
          <SignInForm />
        </div>
        <p className="text-sm text-text mb-6">
          Don't have an account? <Link to="/sign-up">Sign up</Link>
        </p>
        <ReCaptchaFormMessage />
      </section>
    </CenterLayout>
  );
}

export default SignInPage;
