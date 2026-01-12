import React, { useEffect } from 'react';
import { useStore } from '../context/StoreContext';

interface MetaTagsProps {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
}

const MetaTags: React.FC<MetaTagsProps> = ({
  title,
  description,
  image,
  path
}) => {
  const { settings } = useStore();

  useEffect(() => {
    const baseUrl = window.location.origin;
    const fullPath = path || window.location.pathname;
    const fullUrl = `${baseUrl}${fullPath}`;

    // Update document title
    if (title) {
      document.title = `${title} | ${settings.siteName}`;
    }

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (isProperty) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Standard meta tags
    if (description) {
      updateMetaTag('description', description);
    }

    // Open Graph tags
    updateMetaTag('og:title', title || settings.siteName, true);
    if (description) {
      updateMetaTag('og:description', description, true);
    }
    updateMetaTag('og:url', fullUrl, true);
    updateMetaTag('og:type', 'website', true);
    if (image) {
      updateMetaTag('og:image', image, true);
    }

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title || settings.siteName);
    if (description) {
      updateMetaTag('twitter:description', description);
    }
    if (image) {
      updateMetaTag('twitter:image', image);
    }

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);
  }, [title, description, image, path, settings.siteName]);

  return null; // This component doesn't render anything
};

export default MetaTags;
