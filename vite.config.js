import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Multi-page app config
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        register: resolve(__dirname, 'register.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        schedule: resolve(__dirname, 'schedule.html'),
        reports: resolve(__dirname, 'reports.html'),
        quotas: resolve(__dirname, 'quotas.html'),
        support: resolve(__dirname, 'support.html'),
      },
    },
  },
  // Expose env vars to client
  envPrefix: 'VITE_',
});
