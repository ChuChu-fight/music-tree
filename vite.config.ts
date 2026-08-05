import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Relative assets keep the static build portable under a GitHub Pages
  // repository subpath even when no remote repository name is configured yet.
  base: './',
  plugins: [react()],
})
