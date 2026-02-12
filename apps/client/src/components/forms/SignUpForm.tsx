import { useForm } from "react-hook-form";
import InputGroup from "../InputGroup";
import LargeLogo from "../LargeLogo";
import { zodResolver } from "@hookform/resolvers/zod";
import signUpFormSchema, { SignUpFormSchema } from "./signUpForm.schema";
import Button from "../Button/Button";
import ReCaptchaFormMessage from "../ReCaptchaFormMessage";

interface Props {
  signUpRequest: (data: SignUpFormSchema) => Promise<void>;
}

function SignUpForm(props: Props) {
  const form = useForm<SignUpFormSchema>({ resolver: zodResolver(signUpFormSchema), mode: "all" });

  return (
    <form className="flex flex-col gap-10" onSubmit={form.handleSubmit(props.signUpRequest)}>
      <div className="flex flex-col gap-2">
        <LargeLogo />
        <p className="text-sm text-textMuted">Create your free account</p>
      </div>
      <div className="flex flex-col gap-5 border-b pb-5 border-ui-border">
        <InputGroup
          label="Username"
          error={form.formState.errors.username?.message}
          isRequired
          {...form.register("username")}
          placeholder="Username"
          aria-invalid={form.getFieldState("username").invalid}
        />
        <InputGroup
          label="Email"
          error={form.formState.errors.email?.message}
          isRequired
          {...form.register("email")}
          placeholder="Email"
          aria-invalid={form.getFieldState("email").invalid}
        />
        <InputGroup
          label="Password"
          type="password"
          {...form.register("password")}
          isRequired
          error={form.formState.errors.password?.message}
          placeholder="Password"
          aria-invalid={form.getFieldState("password").invalid}
        />
        <InputGroup
          label="Confirm Password"
          type="password"
          {...form.register("confirmPassword")}
          placeholder="Confirm Password"
          isRequired
          error={form.formState.errors.confirmPassword?.message}
          aria-invalid={form.getFieldState("confirmPassword").invalid}
        />
        <Button
          variant="primary"
          type="submit"
          disabled={!form.formState.isValid || form.formState.isSubmitting}
        >
          Create account
        </Button>
        <p className="text-sm text-text">
          Already have an account? <a href="/">Sign in</a>
        </p>
      </div>
      <ReCaptchaFormMessage />
    </form>
  );
}

export default SignUpForm;
