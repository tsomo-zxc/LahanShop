import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,       // 👈 Це дозволяє доступ по мережі
    allowedHosts: true // 👈 ДОДАЙ ЦЕЙ РЯДОК (Дозволяє Ngrok)
  }
})
