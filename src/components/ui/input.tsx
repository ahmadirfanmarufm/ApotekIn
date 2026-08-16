import React from "react";

interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export function Input({
    label,
    error,
    helperText,
    className = "",
    id,
    ...props
}: InputProps) {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;

    return (
        <div className="w-full space-y-1.5">
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-slate-700"
                >
                    {label}
                </label>
            )}

            <input
                id={inputId}
                className={`
                    w-full rounded-xl border bg-white px-3.5 py-2.5
                    text-sm text-slate-800 outline-none
                    transition
                    placeholder:text-slate-400
                    focus:ring-2
                    ${
                        error
                            ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                            : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100"
                    }
                    disabled:cursor-not-allowed
                    disabled:bg-slate-50
                    disabled:text-slate-400
                    ${className}
                `}
                {...props}
            />

            {error ? (
                <p className="text-xs font-medium text-red-500">
                    {error}
                </p>
            ) : helperText ? (
                <p className="text-xs text-slate-400">
                    {helperText}
                </p>
            ) : null}
        </div>
    );
}