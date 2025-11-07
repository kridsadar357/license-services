import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getHardwareId: () => ipcRenderer.invoke('get-hardware-id'),
  activateLicense: (data: {
    licenseKey: string;
    productId: string;
    customerEmail?: string;
    customerName?: string;
  }) => ipcRenderer.invoke('activate-license', data),
  verifyLicense: (activationToken: string) => ipcRenderer.invoke('verify-license', activationToken),
  deactivateLicense: (activationToken: string) => ipcRenderer.invoke('deactivate-license', activationToken),
  windowMinimize: () => ipcRenderer.invoke('window-minimize'),
  windowMaximize: () => ipcRenderer.invoke('window-maximize'),
  windowClose: () => ipcRenderer.invoke('window-close'),
  windowIsMaximized: () => ipcRenderer.invoke('window-is-maximized'),
});

