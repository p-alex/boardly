import { useForm } from "react-hook-form";
import InputGroup from "../../InputGroup";
import LargeLogo from "../../LargeLogo";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "../../Button/Button";
import ReCaptchaFormMessage from "../../ReCaptchaFormMessage";
import {
  sendVerificationCodeFormSchema,
  SendVerificationCodeFormSchema,
} from "./SendVerificationCodeForm.schema";
import { useMutation } from "@tanstack/react-query";
import sendEmailVerificationCodeApi from "../../../api/sendEmailVerificationCodeApi";
import { isAxiosError } from "axios";
import { ServerErrorResponseDto } from "@boardly/shared/dtos/server";
import { useNavigate } from "react-router-dom";
import { verificationCodeFieldValidations } from "@boardly/shared/fieldValidations";

interface Props {
  email?: string;
  code_type: verificationCodeFieldValidations.VerificationCodeType;
  description?: string;
}

const serverErrorToFieldMap: Record<string, keyof SendVerificationCodeFormSchema | "root"> = {
  "A user with that email does not exist.": "email",
  "This email is already verified.": "root",
};

function SendVerificationCodeForm(props: Props) {
  const navigate = useNavigate();

  const form = useForm<SendVerificationCodeFormSchema>({
    defaultValues: { email: props.email ? props.email : "", code_type: props.code_type },
    resolver: zodResolver(sendVerificationCodeFormSchema),
    mode: "all",
  });

  const mutation = useMutation({
    mutationKey: ["send-email-verification-code"],
    mutationFn: (data: SendVerificationCodeFormSchema) => sendEmailVerificationCodeApi(data),
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
      navigate("/verify-email", { state: { email: form.getValues("email") } });
      form.reset();
    },
  });

  const submit = async (data: SendVerificationCodeFormSchema) => {
    try {
      await mutation.mutateAsync(data);
    } catch (error: any) {
      console.log(error.message);
    }
  };

  return (
    <form className="flex flex-col gap-10" onSubmit={form.handleSubmit(submit)}>
      <div className="flex flex-col gap-2">
        <LargeLogo />
        {props?.description && <p className="text-sm text-textMuted">{props.description}</p>}
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

export default SendVerificationCodeForm;
