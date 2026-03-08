import CenterLayout from "../layouts/CenterLayout";
import { useHead } from "@unhead/react";
import SignUpForm from "../components/forms/SignUpForm/SignUpForm";
import { Link, useNavigate } from "react-router-dom";
import LargeLogo from "../components/LargeLogo";
import ReCaptchaFormMessage from "../components/ReCaptchaFormMessage";

function SignUpPage() {
  const navigate = useNavigate();

  useHead({
    title: "Create your free account | Boardly",
  });

  return (
    <CenterLayout>
      <section className="flex flex-col text-center w-full max-w-85">
        <div className="mb-12 flex flex-col gap-2">
          <LargeLogo />
          <h1 className="text-2xl font-bold text-text">Create an account</h1>
        </div>
        <div className="mb-4">
          <SignUpForm onSuccess={({ email }) => navigate("/verify-email", { state: { email } })} />
        </div>
        <p className="text-sm text-text mb-6">
          Already have an account? <Link to="/sign-in">Sign in</Link>
        </p>
        <ReCaptchaFormMessage />
      </section>
    </CenterLayout>
  );
}

export default SignUpPage;
