import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  server: {
    // proxy: {
    //   "/": "https://localhost"
    // },
    host:true,
    port: 3000,
    strictPort: true,
  },
  plugins: [react()],
  build: {
    outDir: "./build",
    rollupOptions: {
      input: 'index.html', // Ensure this points to your entry HTML file
    },
  },
})
