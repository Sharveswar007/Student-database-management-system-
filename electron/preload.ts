import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods to renderer
contextBridge.exposeInMainWorld('electronAPI', {
    // Window controls
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),

    // File operations
    exportFile: (data: string, filename: string) =>
        ipcRenderer.invoke('file:export', data, filename),
    importFile: () => ipcRenderer.invoke('file:import'),

    // Notifications
    showNotification: (title: string, body: string) =>
        ipcRenderer.invoke('notification:show', title, body),
});

// Type definitions for TypeScript
declare global {
    interface Window {
        electronAPI?: {
            minimize: () => Promise<void>;
            maximize: () => Promise<void>;
            close: () => Promise<void>;
            exportFile: (
                data: string,
                filename: string
            ) => Promise<{ success: boolean; path?: string }>;
            importFile: () => Promise<{ success: boolean; data?: any }>;
            showNotification: (
                title: string,
                body: string
            ) => Promise<{ success: boolean; error?: string }>;
        };
    }
}
