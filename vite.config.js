// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor':   ['react', 'react-dom'],
          'three-core':     ['three'],
          'three-fiber':    ['@react-three/fiber', '@react-three/drei'],
          'postprocessing': ['@react-three/postprocessing', 'postprocessing'],
          'lucide':         ['lucide-react'],
          'gsap':           ['gsap'],
        },
      },
    },
    // Warn at 1 MB, hard limit at 3 MB per chunk (three.js is large)
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei'],
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api/ignite': {
        target: 'https://ftc.ignitepathways.org/api/public',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ignite/, ''),
      },
    },
  },
  preview: {
    port: 4173,
  },
});
