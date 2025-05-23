import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5138,
    strictPort: true,
    watch: {
      usePolling: true,
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // TypeScript derleme hatalarını görmezden gel
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  // Üretim ortamında console.log ifadelerini kaldır
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    sourcemap: false
  }
});
