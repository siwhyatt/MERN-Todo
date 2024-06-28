import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production'

  return {
    plugins: [react()],
    server: {
      proxy: isProduction
        ? undefined  // No proxy needed in production
        : {
          '/api': {
            target: 'http://localhost:5000',
            changeOrigin: true,
            secure: false,
            ws: true,
          },
        }
    },
    define: {
      'import.meta.env.API_URL': isProduction
        ? JSON.stringify('https://todo.fullstack.cat/api')  // Production API URL
        : JSON.stringify('http://localhost:5000/api')  // Development API URL
    }
  }
})
