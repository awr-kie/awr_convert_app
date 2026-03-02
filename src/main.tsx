import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { useTelegramWebApp } from './hooks/useTelegramWebApp'
import './index.css'

// Компонент-обертка для инициализации Telegram
const TelegramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useTelegramWebApp();
  return <>{children}</>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TelegramProvider>
      <App />
    </TelegramProvider>
  </React.StrictMode>,
)