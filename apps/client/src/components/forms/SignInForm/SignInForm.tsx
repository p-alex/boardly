import { useForm } from "react-hook-form";
import InputGroup from "../../InputGroup";
import Button from "../../Button/Button";
import { signInFormSchema, SignInFormSchema } from "./SignInForm.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { userPasswordAuth } from "@boardly/shared/fieldValidations";
import { useMutation } from "@tanstack/react-query";
import signInApi from "../../../api/auth/signInApi";
import { isAxiosError } from "axios";
import { ServerErrorResponseDto } from "@boardly/shared/dtos/server";
import { useAuthContext } from "../../../context/AuthContext/AuthContextProvider";

function SignInForm() {
  const authContext = useAuthContext();
  const form = useForm<SignInFormSchema>({ resolver: zodResolver(signInFormSchema), mode: "all" });

  const mutation = useMutation({
    mutationKey: ["sign-in"],
    mutationFn: (data: { email: string; password: string }) => signInApi(data),
    onError: (error) => {
      if (isAxiosError(error)) {
        const { message } = error.response?.data as ServerErrorResponseDto;
        form.setError("root", { message });
      } else {
        form.setError("root", { message: "Something went wrong. Please try again later." });
      }
    },
    onSuccess: (data) => {
      if (data.auth)
        authContext.login({
          user: { id: data.auth.id, username: data.auth.username },
          accessToken: data.auth.accessToken,
        });
      form.reset();
    },
  });

  const submit = async (data: SignInFormSchema) => {
    try {
      await mutation.mutateAsync(data);
    } catch (error: any) {
      console.log(error.message);
    }
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={form.handleSubmit(submit)}>
      {form.formState.errors.root?.message && (
        <p
          data-testid="rootError"
          className="flex items-center justify-center text-sm text-error font-medium gap-1 text-center"
        >
          {form.formState.errors.root.message}
        </p>
      )}
      <div className="flex flex-col gap-5">
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
          error={form.formState.errors.password?.message}
          isRequired
          {...form.register("password")}
          placeholder="Password"
          aria-invalid={form.getFieldState("password").invalid}
          type="password"
          maxLength={userPasswordAuth.PASSWORD_MAX_LENGTH}
        />
        <Button
          variant="primary"
          type="submit"
          disabled={!form.formState.isValid || form.formState.isLoading}
        >
          Sign In
        </Button>
      </div>
    </form>
  );
}

export default SignInForm;
