import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    origin: "http://0.0.0.0:3000",
  },
  plugins: [react()],
  build: {
    outDir: "./build",
    rollupOptions: {
      input: 'index.html', // Ensure this points to your entry HTML file
    },
  },
})
