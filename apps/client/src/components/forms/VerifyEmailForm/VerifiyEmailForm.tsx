import { useForm } from "react-hook-form";
import LargeLogo from "../../LargeLogo";
import { ErrorTraingleIcon } from "../../../svgs";
import InputGroup from "../../InputGroup";
import { zodResolver } from "@hookform/resolvers/zod";
import { VerifyEmailFormSchema, verifyEmailFormSchema } from "./verifyEmailForm.schema";
import Button from "../../Button/Button";
import { useMutation } from "@tanstack/react-query";
import verifyEmailApi from "../../../api/verifyEmailApi";
import { isAxiosError } from "axios";
import { ServerErrorResponseDto } from "@boardly/shared/dtos/server";
import { useNavigate } from "react-router-dom";
import ReCaptchaFormMessage from "../../ReCaptchaFormMessage";

interface Props {
  email: string;
}

const serverErrorToFieldMap: Record<string, keyof VerifyEmailFormSchema> = {
  "Invalid or expired code": "code",
};

function VerifiyEmailForm(props: Props) {
  const navigate = useNavigate();
  const form = useForm<VerifyEmailFormSchema>({
    defaultValues: { email: props.email, code: "" },
    resolver: zodResolver(verifyEmailFormSchema),
    mode: "all",
  });

  const mutation = useMutation({
    mutationKey: ["verify-email"],
    mutationFn: (data: VerifyEmailFormSchema) => verifyEmailApi(data),
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
      navigate("/sign-in");
      form.reset();
    },
  });

  const submit = async (data: VerifyEmailFormSchema) => {
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
          label="Code"
          error={form.formState.errors.code?.message}
          isRequired
          {...form.register("code")}
          placeholder="Code"
          aria-invalid={form.getFieldState("code").invalid}
        />
        <Button
          variant="primary"
          type="submit"
          disabled={!form.formState.isValid || form.formState.isLoading}
        >
          Verify email
        </Button>
      </div>
      <ReCaptchaFormMessage />
    </form>
  );
}

export default VerifiyEmailForm;
