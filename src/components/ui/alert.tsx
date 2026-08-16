import {
    CheckCircle2,
    Info,
    AlertTriangle,
    XCircle,
} from "lucide-react";
import React from "react";

interface AlertProps {
    title: string;
    children?: React.ReactNode;
    variant?: "info" | "success" | "warning" | "danger";
}

export function Alert({
    title,
    children,
    variant = "info",
}: AlertProps) {
    const config = {
        info: {
            icon: Info,
            style: "border-blue-100 bg-blue-50 text-blue-700",
        },
        success: {
            icon: CheckCircle2,
            style: "border-emerald-100 bg-emerald-50 text-emerald-700",
        },
        warning: {
            icon: AlertTriangle,
            style: "border-amber-100 bg-amber-50 text-amber-700",
        },
        danger: {
            icon: XCircle,
            style: "border-red-100 bg-red-50 text-red-700",
        },
    };

    const Icon = config[variant].icon;

    return (
        <div
            className={`
                flex gap-3 rounded-xl border p-4
                ${config[variant].style}
            `}
        >
            <Icon className="mt-0.5 shrink-0" size={18} />

            <div className="min-w-0">
                <p className="text-sm font-semibold">
                    {title}
                </p>

                {children && (
                    <div className="mt-1 text-sm opacity-90">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
}