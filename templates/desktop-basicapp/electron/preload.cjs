const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Generic IPC invoke method
  invoke: (channel, data) => {
    // Whitelist channels for security
    const validChannels = [
      'ping',
      // Add more channels as needed
    ];

    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }

    throw new Error(`Invalid IPC channel: ${channel}`);
  },

  // Helper to check if running in Electron
  isElectron: true,

  // API configuration for Electron
  apiBaseUrl: 'http://localhost:3000',
});
