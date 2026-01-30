'use client';

import { Minus, Square, X, Database } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Titlebar() {
    const [isElectron, setIsElectron] = useState(false);

    useEffect(() => {
        setIsElectron(typeof window !== 'undefined' && !!window.electronAPI);
    }, []);

    if (!isElectron) return null;

    return (
        <div
            className="fixed top-0 left-0 right-0 h-10 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-between px-4 z-50 border-b border-slate-800"
            style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        >
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                    <Database className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                    DBMS Desktop
                </span>
                <span className="text-xs text-slate-500">• PostgreSQL</span>
            </div>

            <div
                className="flex gap-0.5"
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            >
                <button
                    onClick={() => window.electronAPI?.minimize()}
                    className="p-2.5 hover:bg-slate-800 rounded-lg transition-colors group"
                    title="Minimize"
                >
                    <Minus size={14} className="text-slate-400 group-hover:text-white" />
                </button>
                <button
                    onClick={() => window.electronAPI?.maximize()}
                    className="p-2.5 hover:bg-slate-800 rounded-lg transition-colors group"
                    title="Maximize"
                >
                    <Square size={12} className="text-slate-400 group-hover:text-white" />
                </button>
                <button
                    onClick={() => window.electronAPI?.close()}
                    className="p-2.5 hover:bg-red-600 rounded-lg transition-colors group"
                    title="Close"
                >
                    <X size={14} className="text-slate-400 group-hover:text-white" />
                </button>
            </div>
        </div>
    );
}
