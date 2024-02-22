import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import ViteRuby from 'vite-plugin-ruby';

// https://vitejs.dev/config/
export default defineConfig({
  // server: {
  //   host: 'localhost',
  //   hmr: {host: 'localhost'},
  // },
  plugins: [ViteRuby()],
});
