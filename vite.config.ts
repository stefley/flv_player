import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import typescript from '@rollup/plugin-typescript';
import path from 'path'

const resolvePath = (str: string) => path.resolve(__dirname, str);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolvePath("packages/index.ts"),
      name: "JYDFlv",
      fileName: format => `JYDFlv.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom", "flv.js"],
      output: {
        globals: {
          react: "react",
          "react-dom": "react-dom",
          "flvjs": "flv.js"
        }
      },
      plugins: [
          typescript({
          target: "es2015", // 这里指定编译到的版本，
          rootDir: resolvePath("packages/"),
          declaration: true,
          declarationDir: resolvePath("dist"),
          exclude: resolvePath("node_modules/**"),
          allowSyntheticDefaultImports: true,
        }),
      ]
    }
  }
})