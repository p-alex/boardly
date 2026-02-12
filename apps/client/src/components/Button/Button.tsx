import type { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: "primary";
  children: string;
}

function Button({ variant, children, ...buttonProps }: Props) {
  const getBg = () => {
    switch (variant) {
      case "primary":
        return "bg-primary text-white";
    }
  };

  return (
    <button
      type="button"
      {...buttonProps}
      className={`${getBg()} py-2 px-4 rounded-ui font-semibold cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

export default Button;
