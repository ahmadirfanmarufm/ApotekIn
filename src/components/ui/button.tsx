import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "danger" | "secondary";
  size?: "sm" | "md" | "lg" | "xl" | "icon";
}

export function Button({
  children,
  className = "",
  variant = "default",
  size = "md",
  ...props
}: ButtonProps) {
  const baseStyle =
    "inline-flex items-center justify-center gap-2 font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

  const sizeStyle = {
    sm: "h-7 px-3 text-xs rounded-md",
    md: "h-9 px-5 text-sm rounded-lg",
    lg: "h-12 px-7 text-lg rounded-xl",
    xl: "h-14 px-9 text-2xl font-bold rounded-xl",
    icon: "h-10 w-10 p-0 rounded-lg",
  }[size];

  const variantStyle = {
    default:
      "bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700",
    outline:
      "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    ghost:
      "bg-transparent text-slate-600 hover:bg-slate-100",
    danger:
      "bg-red-500 text-white hover:bg-red-600",
    secondary:
      "bg-slate-200/80 text-slate-600 hover:bg-slate-300/80 border border-slate-300/50",
  }[variant];

  return (
    <button
      className={`${baseStyle} ${sizeStyle} ${variantStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}