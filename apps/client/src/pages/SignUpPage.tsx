import CenterLayout from "../layouts/CenterLayout";
import { useHead } from "@unhead/react";
import SignUpForm from "../components/forms/SignUpForm/SignUpForm";
import { Link, useNavigate } from "react-router-dom";
import LargeLogo from "../components/LargeLogo";
import ReCaptchaFormMessage from "../components/ReCaptchaFormMessage";
import { useEffect } from "react";

function SignUpPage() {
  const navigate = useNavigate();

  useHead({
    title: "Create your free account | Boardly",
  });

  const testRequest = async () => {
    const response = await fetch("http://localhost:5000/auth/password-sign-in", {
      method: "post",
      body: JSON.stringify({ email: "email@email.com", password: "!Qapl12bn12!" }),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const json = await response.json();

    if (json?.redirectTo) navigate("/verify-email");
  };

  useEffect(() => {
    testRequest();
  }, []);

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
