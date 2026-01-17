import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { TranslationProvider } from './lib/translations';
import { FontSettingsProvider } from './lib/fontSettings';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TranslationProvider>
      <FontSettingsProvider>
        <App />
      </FontSettingsProvider>
    </TranslationProvider>
  </StrictMode>
);
