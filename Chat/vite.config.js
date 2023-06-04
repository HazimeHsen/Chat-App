import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";
dotenv.config({ path: "../combined.env" });
export default defineConfig({
  server: {
    middleware: [
      createProxyMiddleware("/api", {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        ws: true,
        cookieDomainRewrite: {
          "*": "localhost",
        },
        pathRewrite: {
          "^/api": "",
        },
      }),
    ],
  },
  plugins: [react()],
  optimizeDeps: {
    include: ["buffer-es6"],
  },
});
