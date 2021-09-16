import { defineConfig } from 'vite'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  base: '/',
  plugins: [viteCompression()], // 太大的包進行 gzip 壓縮
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) { // 將 node_modules 依套件名拆小包
          if (id.includes('node_modules')) {
            const libName = id.split('node_modules/')[1].split('/')[0]
            return libName
          }
        },
      },
    },
  },
})
