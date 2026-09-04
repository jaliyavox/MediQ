import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// LOCKED FILE - tell the team before changing this.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
