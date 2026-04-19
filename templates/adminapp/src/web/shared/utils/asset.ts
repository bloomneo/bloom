// Helper function to build paths with base URL
const buildPath = (path: string): string => {
  const base = (import.meta as any).env?.BASE_URL || '/';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  if (base === '/') return `/${cleanPath}`;
  return `${base}${cleanPath}`;
};

// Asset path builder (for static assets like images, fonts, etc.)
export const asset = (path: string): string => {
  return buildPath(path);
};