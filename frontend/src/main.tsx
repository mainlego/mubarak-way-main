import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import { TelegramProvider } from './app/TelegramProvider';
import { ErrorBoundary } from './app/ErrorBoundary';
import { ThemeProvider } from './shared/context/ThemeContext';
import './app/styles/index.css';
import './shared/lib/i18n';

console.log('🚀 main.tsx: Starting application...');
console.log('📱 User Agent:', navigator.userAgent);
console.log('🌐 Window.Telegram:', window.Telegram ? 'Available' : 'Not Available');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <TelegramProvider>
          <App />
        </TelegramProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
);
// Trigger rebuild 30 окт 2025 г. 18:04:49
