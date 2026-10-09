import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Relative base so the build works under any GitHub Pages repo name.
export default defineConfig({
  base: './',
  plugins: [react()],
  test: { environment: 'node' },
})
