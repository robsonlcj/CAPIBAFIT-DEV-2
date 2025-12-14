import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl' // <--- Importe aqui

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    basicSsl() // <--- Adicione aqui na lista de plugins
  ],
  server: {
    host: true, // Garante que libera para a rede (IP)
    https: true // Garante que usa HTTPS
  }
})