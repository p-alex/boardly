import { useForm } from "react-hook-form";
import InputGroup from "../../InputGroup";
import LargeLogo from "../../LargeLogo";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "../../Button/Button";
import ReCaptchaFormMessage from "../../ReCaptchaFormMessage";
import {
  sendEmailVerificationCodeFormSchema,
  SendEmailVerificationCodeFormSchema,
} from "./SendEmailVerificationCodeForm.schema";
import { useMutation } from "@tanstack/react-query";
import sendEmailVerificationCodeApi from "../../../api/sendEmailVerificationCodeApi";
import { isAxiosError } from "axios";
import { ServerErrorResponseDto } from "@boardly/shared/dtos/server";
import { useNavigate } from "react-router-dom";

interface Props {
  email?: string;
}

const serverErrorToFieldMap: Record<string, keyof SendEmailVerificationCodeFormSchema | "root"> = {
  "A user with that email does not exist.": "email",
  "This email is already verified.": "root",
};

function SendEmailVerificationCodeForm(props: Props) {
  const navigate = useNavigate();

  const form = useForm<SendEmailVerificationCodeFormSchema>({
    defaultValues: { email: props.email ? props.email : "" },
    resolver: zodResolver(sendEmailVerificationCodeFormSchema),
    mode: "all",
  });

  const mutation = useMutation({
    mutationKey: ["send-email-verification-code"],
    mutationFn: (data: { email: string }) => sendEmailVerificationCodeApi(data),
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
      navigate("/verify-email", { replace: true });
      form.reset();
    },
  });

  const submit = async (data: SendEmailVerificationCodeFormSchema) => {
    try {
      await mutation.mutateAsync({ email: data.email });
    } catch (error: any) {
      console.log(error.message);
    }
  };

  return (
    <form className="flex flex-col gap-10" onSubmit={form.handleSubmit(submit)}>
      <div className="flex flex-col gap-2">
        <LargeLogo />
        <p className="text-sm text-textMuted">
          You need to verify your email to be able to sign in
        </p>
      </div>
      {form.formState.errors.root?.message && (
        <p
          data-testid="rootError"
          className="flex items-center justify-center text-sm text-error font-medium gap-1 text-center"
        >
          {form.formState.errors.root.message}
        </p>
      )}
      <div className="flex flex-col gap-5 border-b pb-5 border-ui-border">
        <InputGroup
          label="Email"
          error={form.formState.errors.email?.message}
          isRequired
          {...form.register("email")}
          placeholder="Email"
          aria-invalid={form.getFieldState("email").invalid}
        />
        <Button
          variant="primary"
          type="submit"
          disabled={!form.formState.isValid || form.formState.isLoading}
        >
          Send verification code
        </Button>
      </div>
      <ReCaptchaFormMessage />
    </form>
  );
}

export default SendEmailVerificationCodeForm;
