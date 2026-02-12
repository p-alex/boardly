import { useRef, type InputHTMLAttributes } from "react";
import { ErrorTraingleIcon } from "../svgs";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isRequired?: boolean;
}

function InputGroup({ label, error, isRequired, ...inputProps }: Props) {
  const inputBorderColor = !error ? "border-ui-border" : "border-error";

  const id = useRef<string>(crypto.randomUUID()).current;

  return (
    <div className="flex flex-col items-start justify-start text-left gap-0.5">
      {label && (
        <label className="text-sm font-medium" htmlFor={id}>
          {label}
          {isRequired && <span className="text-sm font-semibold text-primary">*</span>}
        </label>
      )}
      <input
        type="text"
        id={id}
        {...inputProps}
        className={`${inputBorderColor} w-full py-2 px-4 border rounded-ui bg-[#fdfdfd]"`}
      />
      {error && (
        <p className="text-sm text-error font-medium flex items-center gap-1">
          <ErrorTraingleIcon className="size-4" /> {error}
        </p>
      )}
    </div>
  );
}

export default InputGroup;
