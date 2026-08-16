import React from "react";

interface BadgeProps {
    children: React.ReactNode;
    variant?: "default" | "success" | "warning" | "danger" | "info";
    className?: string;
}

export function Badge({
    children,
    variant = "default",
    className = "",
}: BadgeProps) {
    const variants = {
        default: "bg-slate-100 text-slate-600",
        success: "bg-emerald-50 text-emerald-600",
        warning: "bg-amber-50 text-amber-600",
        danger: "bg-red-50 text-red-600",
        info: "bg-blue-50 text-blue-600",
    };

    return (
        <span
            className={`
                inline-flex items-center rounded-full
                px-2.5 py-1 text-xs font-semibold
                ${variants[variant]}
                ${className}
            `}
        >
            {children}
        </span>
    );
}