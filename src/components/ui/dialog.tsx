"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface DialogContextValue {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const DialogContext =
    React.createContext<DialogContextValue | null>(null);

interface DialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

export function Dialog({
    open = false,
    onOpenChange = () => {},
    children,
}: DialogProps) {
    return (
        <DialogContext.Provider value={{ open, onOpenChange }}>
            {children}
        </DialogContext.Provider>
    );
}

interface DialogContentProps {
    children: React.ReactNode;
    className?: string;
}

export function DialogContent({
    children,
    className = "",
}: DialogContentProps) {
    const context = React.useContext(DialogContext);

    if (!context) {
        throw new Error(
            "DialogContent harus digunakan di dalam Dialog."
        );
    }

    const { open, onOpenChange } = context;

    useEffect(() => {
        if (!open) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onOpenChange(false);
            }
        };

        document.addEventListener("keydown", handleEscape);

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = originalOverflow;
        };
    }, [open, onOpenChange]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Overlay */}
            <button
                type="button"
                aria-label="Tutup dialog"
                onClick={() => onOpenChange(false)}
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
            />

            {/* Content */}
            <div
                role="dialog"
                aria-modal="true"
                className={`relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl ${className}`}
            >
                {children}

                <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Tutup"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
}

export function DialogHeader({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`
                border-b border-slate-100
                px-5 py-4
                sm:px-6
                ${className}
            `}
        >
            {children}
        </div>
    );
}

export function DialogTitle({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <h2
            className={`
                font-manrope
                text-lg
                font-bold
                text-slate-900
                ${className}
            `}
        >
            {children}
        </h2>
    );
}

export function DialogDescription({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <p
            className={`
                mt-1
                text-sm
                text-slate-500
                ${className}
            `}
        >
            {children}
        </p>
    );
}

export function DialogFooter({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`
                flex
                flex-col-reverse
                gap-3
                border-t
                border-slate-100
                px-5
                py-4
                sm:flex-row
                sm:justify-end
                sm:px-6
                ${className}
            `}
        >
            {children}
        </div>
    );
}