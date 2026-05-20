import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load .env so VITE_BASE_URL is available during config evaluation
  const env = loadEnv(mode, process.cwd(), '')

  return {
    // '/' locally, '/netlore/' on GitHub Pages (set via VITE_BASE_URL in .env)
    base: env.VITE_BASE_URL || '/',

    plugins: [react()],

    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },

    server: {
      port: 5173,
      host: true,   // other devices on same network can connect
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('error', () => {})  // silence ECONNREFUSED when server not running
          },
        },
      },
    },

    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            react:   ['react', 'react-dom'],
            zustand: ['zustand'],
          },
        },
      },
    },
  }
})
