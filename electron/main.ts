import { app, BrowserWindow, ipcMain, dialog, Notification } from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';
import fs from 'fs/promises';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 600,
        frame: false,
        backgroundColor: '#020617',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        icon: path.join(__dirname, '../public/icon.ico'),
    });

    const url = isDev
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, '../out/index.html')}`;

    mainWindow.loadURL(url);

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Show notification when app is ready
    if (Notification.isSupported()) {
        new Notification({
            title: 'DBMS Desktop',
            body: 'Application started successfully',
        }).show();
    }
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

// Window controls
ipcMain.handle('window:minimize', () => {
    mainWindow?.minimize();
});

ipcMain.handle('window:maximize', () => {
    if (!mainWindow) return;
    if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow.maximize();
    }
});

ipcMain.handle('window:close', () => {
    mainWindow?.close();
});

// Export data to file
ipcMain.handle('file:export', async (_event, data: string, filename: string) => {
    if (!mainWindow) return { success: false };

    const { filePath } = await dialog.showSaveDialog(mainWindow, {
        defaultPath: filename,
        filters: [
            { name: 'JSON Files', extensions: ['json'] },
            { name: 'CSV Files', extensions: ['csv'] },
            { name: 'All Files', extensions: ['*'] },
        ],
    });

    if (filePath) {
        await fs.writeFile(filePath, data, 'utf-8');
        return { success: true, path: filePath };
    }

    return { success: false };
});

// Import data from file
ipcMain.handle('file:import', async () => {
    if (!mainWindow) return { success: false };

    const { filePaths } = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
            { name: 'JSON Files', extensions: ['json'] },
            { name: 'All Files', extensions: ['*'] },
        ],
    });

    if (filePaths.length > 0) {
        const data = await fs.readFile(filePaths[0], 'utf-8');
        return { success: true, data: JSON.parse(data) };
    }

    return { success: false };
});

// Show system notification
ipcMain.handle('notification:show', (_event, title: string, body: string) => {
    if (Notification.isSupported()) {
        new Notification({ title, body }).show();
        return { success: true };
    }
    return { success: false, error: 'Notifications not supported' };
});
