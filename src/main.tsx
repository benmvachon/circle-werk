import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'
import { AppRouter } from './routes';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
)
