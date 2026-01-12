import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { registerServiceWorker } from './lib/service-worker';

// ✅ IMPORTANT: Ensure your Tailwind build CSS is actually loaded.
// If you already have a global CSS file, keep this import and point it to the correct file.
// If you do NOT have one, create "styles.css" (Step 3 below) and keep this line exactly.
import './styles.css';

// Register service worker for offline support
registerServiceWorker();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
