import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // GitHub Pages 배포 시 저장소 이름으로 교체 / 로컬은 './'
  base: process.env.VITE_BASE_PATH || './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
