import React from "react";

interface CheckboxProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export function Checkbox({
    label,
    className = "",
    ...props
}: CheckboxProps) {
    return (
        <label className="inline-flex cursor-pointer items-center gap-2">
            <input
                type="checkbox"
                className={`
                    h-4 w-4 rounded border-slate-300
                    text-emerald-500
                    focus:ring-emerald-500
                    ${className}
                `}
                {...props}
            />

            {label && (
                <span className="text-sm text-slate-700">
                    {label}
                </span>
            )}
        </label>
    );
}