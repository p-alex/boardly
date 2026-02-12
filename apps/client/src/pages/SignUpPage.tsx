import FloatingContainer from "../components/FloatingContainer";
import CenterLayout from "../layouts/CenterLayout";
import { useHead } from "@unhead/react";
import SignUpForm from "../components/forms/SignUpForm";

function SignUpPage() {
  useHead({
    title: "Create your free account | Boardly",
  });

  return (
    <CenterLayout>
      <FloatingContainer>
        <SignUpForm signUpRequest={(data) => Promise.resolve(console.log(data))} />
      </FloatingContainer>
    </CenterLayout>
  );
}

export default SignUpPage;
