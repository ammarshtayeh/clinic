import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "gold" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({ variant = "primary", size = "md", loading, className, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 font-bold transition disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" && "rounded-xl px-3 py-2 text-xs",
        size === "md" && "rounded-2xl px-5 py-2.5 text-sm",
        size === "lg" && "rounded-2xl px-6 py-3 text-base",
        variant === "primary" && "soft-button",
        variant === "gold" && "gold-button",
        variant === "ghost" && "ghost-button",
        variant === "danger" && "rounded-2xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-500/30",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          جاري...
        </>
      ) : children}
    </button>
  );
}
