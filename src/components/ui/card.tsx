import React from "react";

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export function Card({
    children,
    className = "",
}: CardProps) {
    return (
        <div
            className={`
                rounded-2xl border border-slate-200
                bg-white shadow-sm
                ${className}
            `}
        >
            {children}
        </div>
    );
}

export function CardHeader({
    children,
    className = "",
}: CardProps) {
    return (
        <div
            className={`
                border-b border-slate-100
                px-5 py-4 sm:px-6
                ${className}
            `}
        >
            {children}
        </div>
    );
}

export function CardContent({
    children,
    className = "",
}: CardProps) {
    return (
        <div
            className={`p-5 sm:p-6 ${className}`}
        >
            {children}
        </div>
    );
}