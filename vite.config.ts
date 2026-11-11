/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      ignored: ['**/*.zip'],
    },
  },
  resolve: {
    alias: {
      // hplus_react import style: pages written here copy into hplus_react unchanged (see src/mfe)
      '@mfe/components': path.resolve(__dirname, './src/mfe/components/index.ts'),
      '@mfe/utils': path.resolve(__dirname, './src/mfe/utils/index.ts'),
      '@': path.resolve(__dirname, './src'),
      '@app': path.resolve(__dirname, './src/app'),
      '@features': path.resolve(__dirname, './src/features'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@services': path.resolve(__dirname, './src/services'),
      '@config': path.resolve(__dirname, './src/config'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Match exact package folders: a loose includes('react') also caught lucide-react, react-redux, etc.
        // while React's own deps (scheduler, cookie…) landed in vendor-libs, making the two chunks import
        // each other — a circular chunk that leaves React undefined at startup (blank page in preview).
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (/node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler|cookie|set-cookie-parser)[\\/]/.test(id)) {
              return 'vendor-react';
            }
            if (/node_modules[\\/](jspdf|jspdf-autotable|exceljs|file-saver)[\\/]/.test(id)) {
              return 'vendor-export';
            }
            return 'vendor-libs';
          }
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov', 'text-summary'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/main.tsx', 'src/vite-env.d.ts'],
    },
  },
})
