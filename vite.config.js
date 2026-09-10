import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Project Pages: set VITE_BASE_PATH=/RepoName/  |  custom domain / user site: /
  const base = env.VITE_BASE_PATH || '/'

  return {
    plugins: [react()],
    base,
    server: {
      allowedHosts: true 
    }
  }
})
