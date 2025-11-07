import 'dotenv/config';
import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import * as path from 'path';
import * as os from 'os';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3000';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 750,
    resizable: true,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: 'TKGH License Services',
  });
  
  // Ensure menu bar is hidden
  mainWindow.setMenuBarVisibility(false);

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5174');
    mainWindow.webContents.openDevTools();
  } else {
    // Production mode: load from dist/renderer (where Vite builds the files)
    // When running from dist/main.js, __dirname is 'dist', so renderer is at dist/renderer
    const rendererPath = path.join(__dirname, 'renderer', 'index.html');
    mainWindow.loadFile(rendererPath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Remove menu bar
  Menu.setApplicationMenu(null);
  
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Get Hardware ID
ipcMain.handle('get-hardware-id', async () => {
  try {
    const networkInterfaces = os.networkInterfaces();
    const macAddresses: string[] = [];
    
    for (const interfaceName in networkInterfaces) {
      const interfaces = networkInterfaces[interfaceName];
      if (interfaces) {
        for (const iface of interfaces) {
          if (iface.mac && iface.mac !== '00:00:00:00:00:00') {
            macAddresses.push(iface.mac);
          }
        }
      }
    }
    
    // Combine with machine info for unique ID
    const machineId = `${os.hostname()}-${os.platform()}-${os.arch()}-${macAddresses[0] || 'unknown'}`;
    return machineId;
  } catch (error) {
    console.error('Error getting hardware ID:', error);
    return `HW-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }
});

// Activate License
ipcMain.handle('activate-license', async (_event, data: {
  licenseKey: string;
  productId: string;
  customerEmail?: string;
  customerName?: string;
}) => {
  try {
    const hardwareId = await getHardwareId();
    
    const response = await axios.post(`${API_URL}/api/v1/license/activate`, {
      licenseKey: data.licenseKey,
      hardwareId: hardwareId,
      productId: data.productId,
      customerEmail: data.customerEmail,
      customerName: data.customerName,
    });

    return { success: true, data: response.data };
  } catch (error: any) {
    // Extract detailed error message
    const errorMessage = error.response?.data?.message || 
                        (error.response?.data?.errors ? 
                          error.response.data.errors.join(', ') : 
                          error.message || 'Activation failed');
    
    return {
      success: false,
      message: errorMessage,
    };
  }
});

// Verify License
ipcMain.handle('verify-license', async (_event, activationToken: string) => {
  try {
    const response = await axios.post(`${API_URL}/api/v1/license/verify`, {
      activationToken: activationToken,
    });

    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Verification failed',
    };
  }
});

// Deactivate License
ipcMain.handle('deactivate-license', async (_event, activationToken: string) => {
  try {
    console.log('[Deactivate] Starting deactivation...');
    console.log('[Deactivate] API_URL:', API_URL);
    console.log('[Deactivate] Activation Token:', activationToken);
    
    const response = await axios.post(`${API_URL}/api/v1/license/deactivate`, {
      activationToken: activationToken,
    });

    console.log('[Deactivate] Success:', response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('[Deactivate] Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
    });
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error ||
                        error.message || 
                        'Deactivation failed';
    
    return {
      success: false,
      message: errorMessage,
      details: error.response?.data,
    };
  }
});

// Window Controls
ipcMain.handle('window-minimize', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('window-close', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.handle('window-is-maximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

async function getHardwareId(): Promise<string> {
  try {
    const networkInterfaces = os.networkInterfaces();
    const macAddresses: string[] = [];
    
    for (const interfaceName in networkInterfaces) {
      const interfaces = networkInterfaces[interfaceName];
      if (interfaces) {
        for (const iface of interfaces) {
          if (iface.mac && iface.mac !== '00:00:00:00:00:00') {
            macAddresses.push(iface.mac);
          }
        }
      }
    }
    
    const machineId = `${os.hostname()}-${os.platform()}-${os.arch()}-${macAddresses[0] || 'unknown'}`;
    return machineId;
  } catch (error) {
    return `HW-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }
}

