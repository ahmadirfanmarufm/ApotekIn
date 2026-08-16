import { PackageOpen } from "lucide-react";
import React from "react";

interface EmptyStateProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export function EmptyState({
    title,
    description,
    action,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
            <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-400">
                <PackageOpen size={28} />
            </div>

            <h3 className="text-base font-bold text-slate-800">
                {title}
            </h3>

            {description && (
                <p className="mt-1 max-w-md text-sm text-slate-500">
                    {description}
                </p>
            )}

            {action && (
                <div className="mt-5">
                    {action}
                </div>
            )}
        </div>
    );
}