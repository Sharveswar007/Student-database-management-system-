import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {
    options: Array<{ value: string | number; label: string }>;
    placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, options, placeholder, ...props }, ref) => {
        return (
            <div className="relative">
                <select
                    className={cn(
                        "flex h-10 w-full appearance-none rounded-lg border-2 border-slate-700 bg-slate-900/50 px-4 py-2 pr-10 text-sm text-white transition-all duration-200",
                        "focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        "hover:border-slate-600",
                        className
                    )}
                    ref={ref}
                    {...props}
                >
                    {placeholder && (
                        <option value="" className="bg-slate-900">
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                            className="bg-slate-900"
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
            </div>
        );
    }
);
Select.displayName = "Select";

export { Select };
