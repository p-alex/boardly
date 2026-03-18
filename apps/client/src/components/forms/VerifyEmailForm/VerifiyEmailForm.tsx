import { useForm } from "react-hook-form";
import { ErrorTraingleIcon } from "../../../svgs";
import InputGroup from "../../InputGroup";
import { zodResolver } from "@hookform/resolvers/zod";
import { VerifyEmailFormSchema, verifyEmailFormSchema } from "./verifyEmailForm.schema";
import Button from "../../Button/Button";
import { useMutation } from "@tanstack/react-query";
import verifyEmailApi from "../../../api/auth/verifyEmailApi";
import { isAxiosError } from "axios";
import { ServerErrorResponseDto } from "@boardly/shared/dtos/server";
import { verificationCodeFieldValidations } from "@boardly/shared/fieldValidations";

interface Props {
  email: string;
  code_type: verificationCodeFieldValidations.VerificationCodeType;
  onSuccess: () => void;
}

const serverErrorToFieldMap: Record<string, keyof VerifyEmailFormSchema> = {
  "Invalid or expired code": "code",
};

function VerifiyEmailForm(props: Props) {
  const form = useForm<VerifyEmailFormSchema>({
    defaultValues: { email: props.email, code: "", code_type: props.code_type },
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
      props.onSuccess();
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
      {form.formState.errors.root?.message && (
        <p
          data-testid="rootError"
          className="flex items-center justify-center text-sm text-error font-medium gap-1 text-center"
        >
          <ErrorTraingleIcon className="size-4" /> {form.formState.errors.root?.message}
        </p>
      )}
      <div className="flex flex-col gap-5">
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
    </form>
  );
}

export default VerifiyEmailForm;
