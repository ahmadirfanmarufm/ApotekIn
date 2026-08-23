"use client";

import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/utils/cn";

export interface LabelProps extends ComponentPropsWithoutRef<"label"> {
  required?: boolean;
}

export function Label({
  className,
  required = false,
  children,
  ...props
}: LabelProps) {
  return (
    <label
      className={cn(
        "text-sm font-medium leading-none text-slate-700",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    >
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
}
