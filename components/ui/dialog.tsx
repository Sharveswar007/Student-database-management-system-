"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "./button";

interface DialogProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ open, onClose, children }) => {
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (open) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in-0"
                onClick={onClose}
            />
            {/* Content */}
            <div className="relative z-50 w-full max-w-lg max-h-[90vh] overflow-auto animate-in zoom-in-95 fade-in-0 duration-200">
                {children}
            </div>
        </div>
    );
};

const DialogContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { onClose?: () => void }
>(({ className, children, onClose, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "relative rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl",
            className
        )}
        {...props}
    >
        {onClose && (
            <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 h-8 w-8"
                onClick={onClose}
            >
                <X className="h-4 w-4" />
            </Button>
        )}
        {children}
    </div>
));
DialogContent.displayName = "DialogContent";

const DialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn("flex flex-col space-y-2 mb-4", className)}
        {...props}
    />
);
DialogHeader.displayName = "DialogHeader";

const DialogTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h2
        ref={ref}
        className={cn("text-xl font-semibold text-white", className)}
        {...props}
    />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-slate-400", className)}
        {...props}
    />
));
DialogDescription.displayName = "DialogDescription";

const DialogFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn("flex justify-end gap-3 mt-6", className)}
        {...props}
    />
);
DialogFooter.displayName = "DialogFooter";

export {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
};
