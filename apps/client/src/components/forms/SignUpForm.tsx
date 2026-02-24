import { useForm } from "react-hook-form";
import InputGroup from "../InputGroup";
import LargeLogo from "../LargeLogo";
import { zodResolver } from "@hookform/resolvers/zod";
import signUpFormSchema, { SignUpFormSchema } from "./signUpForm.schema";
import Button from "../Button/Button";
import ReCaptchaFormMessage from "../ReCaptchaFormMessage";
import { isAxiosError } from "axios";
import { ServerErrorResponseDto } from "@boardly/shared/dtos/server";
import { useMutation } from "@tanstack/react-query";
import signUpApi from "../../api/signUpApi";
import { ErrorTraingleIcon } from "../../svgs";
import { useNavigate } from "react-router-dom";

const serverErrorToFieldMap: Record<string, keyof SignUpFormSchema> = {
  "A user with that username already exists.": "username",
  "A user with that email already exists.": "email",
  "Password has been found in a data breech and it's not safe to use. Please try another one.":
    "password",
};

function SignUpForm() {
  const navigate = useNavigate();

  const form = useForm<SignUpFormSchema>({ resolver: zodResolver(signUpFormSchema), mode: "all" });

  const signUpMutation = useMutation({
    mutationKey: ["password-sign-up"],
    mutationFn: (data: { username: string; email: string; password: string }) => signUpApi(data),
    onError: (error) => {
      if (isAxiosError(error)) {
        const { message } = error.response?.data as ServerErrorResponseDto;

        if (!serverErrorToFieldMap[message]) {
          form.setError("root", { message });
          return;
        }

        form.setError(serverErrorToFieldMap[message], { message });
        return;
      }
    },
    onSuccess: () => {
      navigate("/send-email-verification-code", { state: { email: form.getValues("email") } });
      form.reset();
    },
  });

  const handleSignUp = async (data: SignUpFormSchema) => {
    try {
      await signUpMutation.mutateAsync({
        email: data.email,
        username: data.username,
        password: data.password,
      });
    } catch (error: any) {
      console.log(error.message);
    }
  };

  return (
    <form className="flex flex-col gap-10" onSubmit={form.handleSubmit(handleSignUp)}>
      <div className="flex flex-col gap-2">
        <LargeLogo />
        <p className="text-sm text-textMuted">Create your free account</p>
      </div>
      {form.formState.errors.root?.message && (
        <p
          data-testid="rootError"
          className="flex items-center justify-center text-sm text-error font-medium gap-1 text-center"
        >
          <ErrorTraingleIcon className="size-4" /> {form.formState.errors.root?.message}
        </p>
      )}
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
