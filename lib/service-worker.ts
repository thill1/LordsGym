// Service Worker Registration
export const registerServiceWorker = () => {
  // Only register in production and if service workers are supported
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    // Use setTimeout to ensure this doesn't block page load
    setTimeout(() => {
      window.addEventListener('load', () => {
        try {
          // Use base path for GitHub Pages
          const basePath = import.meta.env.BASE_URL || '/';
          // Ensure basePath ends with / for proper path joining
          const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;
          const swPath = `${normalizedBase}sw.js`;
          
          navigator.serviceWorker
            .register(swPath)
            .then((registration) => {
              console.log('Service Worker registered successfully:', registration.scope);
            })
            .catch((error) => {
              // Silently fail - service worker is optional
              console.warn('Service Worker registration failed (non-critical):', error);
            });
        } catch (error) {
          // Silently fail - service worker is optional
          console.warn('Service Worker registration error (non-critical):', error);
        }
      });
    }, 100);
  }
};
