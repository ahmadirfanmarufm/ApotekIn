import React from "react";

interface SelectOption {
    label: string;
    value: string;
}

interface SelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: SelectOption[];
    error?: string;
    helperText?: string;
}

export function Select({
    label,
    options,
    error,
    helperText,
    className = "",
    id,
    ...props
}: SelectProps) {
    const selectId =
        id || `select-${Math.random().toString(36).slice(2, 9)}`;

    return (
        <div className="w-full space-y-1.5">
            {label && (
                <label
                    htmlFor={selectId}
                    className="block text-sm font-medium text-slate-700"
                >
                    {label}
                </label>
            )}

            <select
                id={selectId}
                className={`
                    w-full appearance-none rounded-xl border
                    bg-white px-3.5 py-2.5 text-sm text-slate-800
                    outline-none transition
                    ${
                        error
                            ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                            : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100"
                    }
                    focus:ring-2
                    disabled:cursor-not-allowed
                    disabled:bg-slate-50
                    ${className}
                `}
                {...props}
            >
                <option value="">Pilih...</option>

                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                    >
                        {option.label}
                    </option>
                ))}
            </select>

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