/**
 * API Configuration for Desktop App
 * Configures the base API URL for Electron environment
 */

export function getApiBaseUrl(): string {
  // In Electron, use the exposed API URL
  if (typeof window !== 'undefined' && window.electronAPI?.apiBaseUrl) {
    return window.electronAPI.apiBaseUrl;
  }

  // Fallback to environment variable (for web version)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Default fallback
  return 'http://localhost:3000';
}

// Export configured API base URL
export const API_BASE_URL = getApiBaseUrl();
