/**
 * Preload — the only bridge between the page and the main process.
 *
 * Channels are whitelisted rather than forwarded. `ipcRenderer.invoke` exposed
 * directly would let any script in the page — including one that arrived
 * through a dependency — call any handler the main process registers.
 */
const { contextBridge, ipcRenderer } = require('electron');

const VALID_CHANNELS = ['ping'];

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,

  invoke(channel, data) {
    if (!VALID_CHANNELS.includes(channel)) {
      return Promise.reject(new Error(`Invalid IPC channel: ${channel}`));
    }
    return ipcRenderer.invoke(channel, data);
  },
});
