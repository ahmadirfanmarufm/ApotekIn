import React from "react";

interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export function Textarea({
    label,
    error,
    helperText,
    className = "",
    id,
    ...props
}: TextareaProps) {
    const textareaId =
        id || `textarea-${Math.random().toString(36).slice(2, 9)}`;

    return (
        <div className="w-full space-y-1.5">
            {label && (
                <label
                    htmlFor={textareaId}
                    className="block text-sm font-medium text-slate-700"
                >
                    {label}
                </label>
            )}

            <textarea
                id={textareaId}
                className={`
                    min-h-[110px] w-full resize-y rounded-xl border
                    bg-white px-3.5 py-3 text-sm text-slate-800
                    outline-none transition
                    placeholder:text-slate-400
                    ${
                        error
                            ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                            : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100"
                    }
                    focus:ring-2
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