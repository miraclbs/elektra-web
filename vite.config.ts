import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/elektra-web/', // 👈 repo adını birebir yazdık (küçük harf, tireli)
  plugins: [react()],
})