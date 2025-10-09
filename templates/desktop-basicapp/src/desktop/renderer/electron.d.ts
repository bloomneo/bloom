export interface ElectronAPI {
  invoke: <T = any>(channel: string, data?: any) => Promise<T>;
  isElectron: boolean;
  apiBaseUrl: string;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
