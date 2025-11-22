import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Vite plugin that writes the dev server port to a file
 * @returns {import('vite').Plugin}
 */
export default function vitePluginPortFile() {
  return {
    name: 'vite-plugin-port-file',
    configureServer(server) {
      server.httpServer?.once('listening', () => {
        const address = server.httpServer.address();
        const port = typeof address === 'object' ? address.port : 5183;
        writeFileSync(join(process.cwd(), '.vite-port'), port.toString());
        console.log(`📝 Port ${port} written to .vite-port file`);
      });
    }
  };
}
