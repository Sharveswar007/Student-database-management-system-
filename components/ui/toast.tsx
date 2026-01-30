"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

interface ToastProps {
    id: string;
    title: string;
    description?: string;
    variant?: "default" | "success" | "error" | "warning" | "info";
    onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
    id,
    title,
    description,
    variant = "default",
    onClose,
}) => {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, 5000);

        return () => clearTimeout(timer);
    }, [id, onClose]);

    const icons = {
        default: null,
        success: <CheckCircle className="h-5 w-5 text-emerald-400" />,
        error: <XCircle className="h-5 w-5 text-red-400" />,
        warning: <AlertCircle className="h-5 w-5 text-amber-400" />,
        info: <Info className="h-5 w-5 text-blue-400" />,
    };

    const variants = {
        default: "border-slate-700 bg-slate-900",
        success: "border-emerald-500/30 bg-emerald-950/50",
        error: "border-red-500/30 bg-red-950/50",
        warning: "border-amber-500/30 bg-amber-950/50",
        info: "border-blue-500/30 bg-blue-950/50",
    };

    return (
        <div
            className={cn(
                "flex items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm animate-in slide-in-from-right-full duration-300",
                variants[variant]
            )}
        >
            {icons[variant]}
            <div className="flex-1">
                <p className="text-sm font-medium text-white">{title}</p>
                {description && (
                    <p className="mt-1 text-sm text-slate-400">{description}</p>
                )}
            </div>
            <button
                onClick={() => onClose(id)}
                className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
};

interface ToastContextType {
    toasts: ToastProps[];
    addToast: (toast: Omit<ToastProps, "id" | "onClose">) => void;
    removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(
    undefined
);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<ToastProps[]>([]);

    const addToast = React.useCallback(
        (toast: Omit<ToastProps, "id" | "onClose">) => {
            const id = Math.random().toString(36).substring(7);
            setToasts((prev) => [...prev, { ...toast, id, onClose: removeToast }]);
        },
        []
    );

    const removeToast = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80">
                {toasts.map((toast) => (
                    <Toast key={toast.id} {...toast} onClose={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
