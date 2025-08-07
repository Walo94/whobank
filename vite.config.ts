import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Cualquier petición que empiece con /api...
      '/api': {
        // ...se redirigirá a tu backend de FastAPI
        target: 'http://127.0.0.1:8000',
        // Cambia el origen de la cabecera para que coincida con el target
        changeOrigin: true,
        // Reescribe la ruta para quitar /api antes de enviarla al backend
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      }
  },
  plugins: [
    react(),
    
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
