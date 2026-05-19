import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@project': path.resolve(__dirname, '..'),
      // Fichiers importés depuis ../project-.jsx doivent résoudre depuis ce dossier (node_modules ici)
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'react-dropzone': path.resolve(__dirname, 'node_modules/react-dropzone'),
    },
  },
})
