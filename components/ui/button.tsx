import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
  loading?: boolean;
}

export function Button({ variant = "primary", loading, className, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50",
        variant === "primary" && "soft-button",
        variant === "ghost" && "ghost-button",
        variant === "danger" && "rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "جاري..." : children}
    </button>
  );
}
