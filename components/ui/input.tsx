import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full rounded-lg border-2 border-slate-700 bg-slate-900/50 px-4 py-2 text-sm text-white placeholder:text-slate-500 transition-all duration-200",
                    "focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "hover:border-slate-600",
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = "Input";

export { Input };
