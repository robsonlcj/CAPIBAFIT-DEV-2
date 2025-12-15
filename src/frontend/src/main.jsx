import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Estilos de bibliotecas
import 'leaflet/dist/leaflet.css';

// Estilos do Tailwind (CRUCIAL: Adicione esta linha)
import './index.css'; 

// Seus estilos antigos (pode manter se quiser, ou remover depois se for usar só Tailwind)
import './pages/style/style.css'

import App from './app'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)