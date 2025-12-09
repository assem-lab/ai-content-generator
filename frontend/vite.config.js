import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  
  // Сервер разработки
  server: {
    port: 3000,
    open: true,
    host: true,
    cors: true,
  },
  
  // Production сборка
  build: {
    outDir: "dist",
    sourcemap: false, // sourcemaps только в development
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Удаляем console.log в production
        drop_debugger: true,
      },
    },
    
    // Оптимизация чанков - ПРАВИЛЬНЫЙ способ
    rollupOptions: {
      output: {
        // Автоматическое разделение чанков
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom")) {
              return "vendor-react";
            }
            if (id.includes("axios")) {
              return "vendor-axios";
            }
            // Все остальные node_modules
            return "vendor-other";
          }
          
          // Ваши компоненты - если хотите отдельный чанк
          if (id.includes("/src/components/")) {
            return "components";
          }
          
          // Ваши утилиты
          if (id.includes("/src/utils/")) {
            return "utils";
          }
        },
        
        // Имена файлов с хэшами для кэширования
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
      },
    },
    
    chunkSizeWarningLimit: 1000, // 1MB warning limit
    reportCompressedSize: true,
  },
  
  // Разрешение путей и алиасы
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@components": path.resolve(__dirname, "src/components"),
      "@api": path.resolve(__dirname, "src/api"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@contexts": path.resolve(__dirname, "src/contexts"),
    },
    
    // Расширения по умолчанию
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
  },
  
  // CSS настройки
  css: {
    modules: {
      localsConvention: "camelCase",
    },
    postcss: "./postcss.config.js", // если будете использовать PostCSS
  },
  
  // Оптимизация зависимостей
  optimizeDeps: {
    include: ["react", "react-dom", "axios"],
    exclude: [],
  },
  
  // Environment переменные
  envPrefix: "VITE_",
  
  // Base public path (для деплоя в subdirectory если нужно)
  base: "./",
});
