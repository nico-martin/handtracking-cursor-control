import { crx, defineManifest } from '@crxjs/vite-plugin';
import preact from '@preact/preset-vite';
import { resolve } from 'path';
import { defineConfig } from 'vite';

import packageJson from './package.json';

const { version, title } = packageJson;
const [major, minor, patch, label = '0'] = version
  .replace(/[^\d.-]+/g, '')
  .split(/[.-]/);

const manifest = defineManifest(async (env) => ({
  name: (env.mode === 'staging' ? '[INTERNAL] ' : '') + title,
  description: title,
  manifest_version: 3,
  background: {
    service_worker: 'src/serviceWorker/serviceWorker.ts',
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/contentScript/contentScript.ts'],
    },
  ],
  permissions: ['scripting', 'storage'],
  host_permissions: ['<all_urls>'],
  action: {
    default_title: 'Handtracking Cursor Control Extension',
    default_popup: 'popup.html',
    default_icon: {
      '16': 'src/icons/16x.png',
      '32': 'src/icons/32x.png',
      '48': 'src/icons/48x.png',
      '128': 'src/icons/128x.png',
      /*loading_16: 'src/icons/loading_16x.png',
      loading_32: 'src/icons/loading_32x.png',
      loading_48: 'src/icons/loading_48x.png',
      loading_128: 'src/icons/loading_128x.png',
      active_16: 'src/icons/active_16x.png',
      active_32: 'src/icons/active_32x.png',
      active_48: 'src/icons/active_48x.png',
      active_128: 'src/icons/active_128x.png',*/
    },
  },
  icons: {
    '16': 'src/icons/16x.png',
    '32': 'src/icons/32x.png',
    '48': 'src/icons/48x.png',
    '128': 'src/icons/128x.png',
  },
  version: `${major}.${minor}.${patch}.${label}`,
  version_name: version,
}));

export default defineConfig({
  plugins: [preact(), crx({ manifest })],
});
