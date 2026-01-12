// Service Worker Registration
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Use base path for GitHub Pages
      const basePath = import.meta.env.BASE_URL || '/';
      const swPath = `${basePath}sw.js`;
      
      navigator.serviceWorker
        .register(swPath)
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
};
