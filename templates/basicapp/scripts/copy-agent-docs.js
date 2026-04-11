/**
 * postinstall: copy llms.txt + AGENTS.md from installed packages into docs/
 *
 * Run automatically after `npm install`. Safe to re-run — always overwrites
 * with the version that matches the installed packages.
 *
 * Output:
 *   docs/appkit.md        — @bloomneo/appkit full API reference
 *   docs/appkit-agents.md — @bloomneo/appkit agent rules (always/never)
 *   docs/uikit.md         — @bloomneo/uikit full API reference
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const docsDir = path.join(root, 'docs');

if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

const copies = [
  {
    src: path.join(root, 'node_modules/@bloomneo/appkit/llms.txt'),
    dest: path.join(docsDir, 'appkit.md'),
    label: '@bloomneo/appkit API reference',
  },
  {
    src: path.join(root, 'node_modules/@bloomneo/appkit/AGENTS.md'),
    dest: path.join(docsDir, 'appkit-agents.md'),
    label: '@bloomneo/appkit agent rules',
  },
  {
    src: path.join(root, 'node_modules/@bloomneo/uikit/llms.txt'),
    dest: path.join(docsDir, 'uikit.md'),
    label: '@bloomneo/uikit API reference',
  },
];

let ok = 0;
for (const { src, dest, label } of copies) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✅ docs/${path.basename(dest)} — ${label}`);
    ok++;
  } else {
    console.warn(`⚠️  Skipped ${label} (source not found: ${src})`);
  }
}

if (ok > 0) {
  console.log(`\n📚 Agent docs ready in docs/ — read these before generating code.\n`);
}
