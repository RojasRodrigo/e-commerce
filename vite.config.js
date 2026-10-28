import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

export default defineConfig(({ mode }) => {
  const projectRoot = fileURLToPath(new URL('.', import.meta.url))
  const env = loadEnv(mode, projectRoot, '')
  const apiUrl = env.DOLIBARR_API_URL
  const apiKey = env.DOLIBARR_API_KEY
  const dolibarrConfigured = Boolean(apiUrl && apiKey)
  const proxy = {
    '/api': {
      target: 'http://127.0.0.1:4173',
      changeOrigin: false,
    },
  }

  if (dolibarrConfigured) {
    const api = new URL(apiUrl)
    const apiBasePath = api.pathname.replace(/\/+$/, '')

    proxy['/dolibarr'] = {
      target: api.origin,
      changeOrigin: true,
      headers: { DOLAPIKEY: apiKey },
      rewrite: (path) => `${apiBasePath}${path.replace(/^\/dolibarr/, '')}`,
    }
  }

  return {
    envPrefix: 'PUBLIC_',
    define: {
      'import.meta.env.DOLIBARR_ENABLED': JSON.stringify(dolibarrConfigured),
    },
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: { proxy },
  }
})