/// <reference types="vitest" />
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'


// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;
const sus = process.cwd();

// https://vitejs.dev/config/
export default defineConfig(async ({mode}) => {
  const env = loadEnv(mode, process.cwd());
  const BSKY_MEDIA_DOWNLOAD_ROUTE = `${env.VITE_BSKY_MEDIA_DOWNLOAD_PROXY_ROUTE}`;
  const BSKY_MEDIA_DOWNLOAD_TARGET = `${env.VITE_BSKY_MEDIA_DOWNLOAD_PROXY_TARGET}`;

  return{
    plugins: [
      vue(),
      Icons({compiler: 'vue3'}, ),
      Components({
        dts: true,
        include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
        resolvers: [
          IconsResolver()
        ],
      }),
    ],
    test:{
      globals: true,
      environment: "jsdom",
    },

    // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
    //
    // 1. prevent vite from obscuring rust errors
    clearScreen: false,
    // 2. tauri expects a fixed port, fail if that port is not available
    server: {
      port: 1420,
      strictPort: true,
      host: host || false,
      hmr: host
        ? {
            protocol: "ws",
            host,
            port: 1421,
          }
        : undefined,
      watch: {
        // 3. tell vite to ignore watching `src-tauri`
        ignored: ["**/src-tauri/**"],
      },
      proxy:{
         [BSKY_MEDIA_DOWNLOAD_ROUTE]:{
          target:BSKY_MEDIA_DOWNLOAD_TARGET,
          changeOrigin: true
        }
      }
    },
  }
});
