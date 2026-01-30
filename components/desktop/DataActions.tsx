'use client';

import { useState, useEffect } from 'react';
import { Download, Upload, FileJson, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';

interface ExportDataButtonProps {
    data: any[];
    filename: string;
    label?: string;
}

export function ExportDataButton({ data, filename, label = 'Export' }: ExportDataButtonProps) {
    const [isElectron, setIsElectron] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        setIsElectron(typeof window !== 'undefined' && !!window.electronAPI);
    }, []);

    const exportAsJson = async () => {
        const jsonData = JSON.stringify(data, null, 2);

        if (isElectron && window.electronAPI) {
            const result = await window.electronAPI.exportFile(jsonData, `${filename}.json`);
            if (result.success) {
                addToast({ title: 'Export Successful', description: `Saved to ${result.path}`, variant: 'success' });
            } else {
                addToast({ title: 'Export Cancelled', variant: 'info' });
            }
        } else {
            // Browser fallback
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}.json`;
            a.click();
            URL.revokeObjectURL(url);
            addToast({ title: 'Export Successful', variant: 'success' });
        }
        setShowDialog(false);
    };

    const exportAsCsv = async () => {
        if (data.length === 0) {
            addToast({ title: 'No Data', description: 'Nothing to export', variant: 'warning' });
            return;
        }

        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','),
            ...data.map(row =>
                headers.map(header => {
                    const value = row[header];
                    const escaped = String(value ?? '').replace(/"/g, '""');
                    return `"${escaped}"`;
                }).join(',')
            )
        ];
        const csvData = csvRows.join('\n');

        if (isElectron && window.electronAPI) {
            const result = await window.electronAPI.exportFile(csvData, `${filename}.csv`);
            if (result.success) {
                addToast({ title: 'Export Successful', description: `Saved to ${result.path}`, variant: 'success' });
            } else {
                addToast({ title: 'Export Cancelled', variant: 'info' });
            }
        } else {
            // Browser fallback
            const blob = new Blob([csvData], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            addToast({ title: 'Export Successful', variant: 'success' });
        }
        setShowDialog(false);
    };

    return (
        <>
            <Button variant="outline" onClick={() => setShowDialog(true)}>
                <Download className="w-4 h-4" />
                {label}
            </Button>

            <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
                <DialogContent onClose={() => setShowDialog(false)}>
                    <DialogHeader>
                        <DialogTitle>Export Data</DialogTitle>
                        <DialogDescription>
                            Choose a format to export {data.length} records
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4 my-4">
                        <button
                            onClick={exportAsJson}
                            className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-slate-700 hover:border-violet-500 hover:bg-violet-500/10 transition-all group"
                        >
                            <FileJson className="w-10 h-10 text-violet-400" />
                            <div className="text-center">
                                <p className="font-semibold text-white">JSON</p>
                                <p className="text-xs text-slate-400">Structured data format</p>
                            </div>
                        </button>

                        <button
                            onClick={exportAsCsv}
                            className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-slate-700 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all group"
                        >
                            <FileSpreadsheet className="w-10 h-10 text-emerald-400" />
                            <div className="text-center">
                                <p className="font-semibold text-white">CSV</p>
                                <p className="text-xs text-slate-400">Spreadsheet compatible</p>
                            </div>
                        </button>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowDialog(false)}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

interface ImportDataButtonProps {
    onImport: (data: any[]) => void;
    label?: string;
}

export function ImportDataButton({ onImport, label = 'Import' }: ImportDataButtonProps) {
    const [isElectron, setIsElectron] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        setIsElectron(typeof window !== 'undefined' && !!window.electronAPI);
    }, []);

    const handleImport = async () => {
        if (isElectron && window.electronAPI) {
            const result = await window.electronAPI.importFile();
            if (result.success && result.data) {
                const data = Array.isArray(result.data) ? result.data : [result.data];
                onImport(data);
                addToast({
                    title: 'Import Successful',
                    description: `Imported ${data.length} records`,
                    variant: 'success'
                });
            } else {
                addToast({ title: 'Import Cancelled', variant: 'info' });
            }
        } else {
            // Browser fallback using file input
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                    const text = await file.text();
                    try {
                        const data = JSON.parse(text);
                        const records = Array.isArray(data) ? data : [data];
                        onImport(records);
                        addToast({
                            title: 'Import Successful',
                            description: `Imported ${records.length} records`,
                            variant: 'success'
                        });
                    } catch {
                        addToast({ title: 'Invalid JSON', description: 'Could not parse file', variant: 'error' });
                    }
                }
            };
            input.click();
        }
    };

    return (
        <Button variant="outline" onClick={handleImport}>
            <Upload className="w-4 h-4" />
            {label}
        </Button>
    );
}
