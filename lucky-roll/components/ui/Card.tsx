import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  interactive?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingClasses = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      glass = false,
      interactive = false,
      padding = "md",
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={[
          "rounded-3xl border border-[var(--card-border)]",
          glass
            ? "bg-white/5 backdrop-blur-xl"
            : "bg-[var(--card)]",
          interactive
            ? "cursor-pointer transition-all duration-150 hover:border-brand-500/40 hover:shadow-card-hover active:scale-[0.98]"
            : "shadow-card",
          paddingClasses[padding],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
