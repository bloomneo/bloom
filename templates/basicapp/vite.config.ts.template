import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'url'

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  // base: '/', // Uncomment this line to make the default asset loading to '/' rather than relative paths
  plugins: [react(), tailwindcss()],
  root: 'src/web',
  publicDir: false, // Disable automatic public dir copying
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../.."),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: '../../dist',
    sourcemap: true,
    emptyOutDir: false, // Don't clear dist since API files are also there
    assetsDir: 'assets', // Put all assets in assets/ subdirectory
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          uikit: ['@bloomneo/uikit']
        },
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Put public assets (favicon, images) in public/ subdirectory
          const nameParts = assetInfo.name?.split('.');
          const extType = nameParts ? nameParts[nameParts.length - 1] : '';
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return 'public/[name]-[hash].[ext]';
          }
          // Put CSS and other assets in assets/
          return 'assets/[name]-[hash].[ext]';
        }
      }
    }
  }
})