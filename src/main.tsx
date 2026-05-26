import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register service worker (handled by vite-plugin-pwa in production)
// In dev, the SW is not active — use `npm run build && npm run preview` to test PWA
