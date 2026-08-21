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

interface DialogTriggerProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
}

export function DialogTrigger({
    asChild = false,
    children,
    onClick,
    ...props
}: DialogTriggerProps) {
    const context = React.useContext(DialogContext);

    if (!context) {
        throw new Error(
            "DialogTrigger harus digunakan di dalam Dialog."
        );
    }

    const { onOpenChange } = context;

    if (asChild && React.isValidElement(children)) {
        const child = children as React.ReactElement<{
            onClick?: React.MouseEventHandler<HTMLElement>;
        }>;

        return React.cloneElement(child, {
            ...props,
            onClick: (event: React.MouseEvent<HTMLElement>) => {
                child.props.onClick?.(event);

                if (!event.defaultPrevented) {
                    onClick?.(
                        event as unknown as React.MouseEvent<HTMLButtonElement>
                    );
                    onOpenChange(true);
                }
            },
        });
    }

    return (
        <button
            type="button"
            {...props}
            onClick={(event) => {
                onClick?.(event);

                if (!event.defaultPrevented) {
                    onOpenChange(true);
                }
            }}
        >
            {children}
        </button>
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

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = originalOverflow;
        };
    }, [open, onOpenChange]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <button
                type="button"
                aria-label="Tutup dialog"
                onClick={() => onOpenChange(false)}
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="dialog-title"
                className={`relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl ${className}`}
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
                py-4
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
            id="dialog-title"
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
                py-4
                sm:flex-row
                sm:justify-end
                ${className}
            `}
        >
            {children}
        </div>
    );
}