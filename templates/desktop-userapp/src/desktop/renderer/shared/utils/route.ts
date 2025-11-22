/**
 * Generate a route path with parameters
 * @param path - Route path template (e.g., '/user/:id')
 * @param params - Parameters object (e.g., { id: 1 })
 */
export const route = (path: string, params?: Record<string, string | number>): string => {
  if (!params) return path;

  let result = path;
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`:${key}`, String(value));
  });

  return result;
};
