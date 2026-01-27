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
              
              // Check for updates on page load
              registration.update();
              
              // Listen for service worker updates
              registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (newWorker) {
                  newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                      // New service worker available
                      console.log('New service worker available. Page will reload in 1 second.');
                      // Auto-reload after 1 second to get the new version
                      setTimeout(() => {
                        window.location.reload();
                      }, 1000);
                    }
                  });
                }
              });
              
              // Check for updates every 5 minutes
              setInterval(() => {
                registration.update();
              }, 5 * 60 * 1000);
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
