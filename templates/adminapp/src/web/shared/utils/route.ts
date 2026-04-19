// Helper function to build paths with base URL
const buildPath = (path: string): string => {
  const base = (import.meta as any).env?.BASE_URL || '/';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  if (base === '/') return `/${cleanPath}`;
  return `${base}${cleanPath}`;
};

// Route path builder (for navigation routes)
export const route = (path: string): string => {
  return buildPath(path);
};