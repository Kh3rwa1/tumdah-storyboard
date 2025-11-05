import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// If you deploy to GitHub Pages later, update `base: "/<repo-name>/"`

export default defineConfig({
  plugins: [react()]
})
