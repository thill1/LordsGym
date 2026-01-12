import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import Button from '../Button';

interface SchemaMarkupEditorProps {
  pageSlug?: string;
  onSave?: (schema: any) => void;
}

const SchemaMarkupEditor: React.FC<SchemaMarkupEditorProps> = ({ pageSlug, onSave }) => {
  const { showSuccess, showError } = useToast();
  const [schemaType, setSchemaType] = useState<'Organization' | 'LocalBusiness' | 'Event' | 'Product' | 'Article'>('Organization');
  const [schemaJson, setSchemaJson] = useState('');

  const generateDefaultSchema = () => {
    const baseUrl = window.location.origin + (import.meta.env.BASE_URL || '').replace(/\/$/, '');
    
    const schemas: Record<string, any> = {
      Organization: {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Lord's Gym",
        "url": baseUrl,
        "logo": `${baseUrl}/media/lords-gym/lords-gym-logo-transparent.png`,
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+1-530-537-2105",
          "contactType": "customer service",
          "areaServed": "US",
          "availableLanguage": "English"
        },
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "258 Elm Ave",
          "addressLocality": "Auburn",
          "addressRegion": "CA",
          "postalCode": "95603",
          "addressCountry": "US"
        }
      },
      LocalBusiness: {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "Lord's Gym",
        "image": `${baseUrl}/media/lords-gym/lords-gym-logo-transparent.png`,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "258 Elm Ave",
          "addressLocality": "Auburn",
          "addressRegion": "CA",
          "postalCode": "95603",
          "addressCountry": "US"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "38.8966",
          "longitude": "-121.0768"
        },
        "url": baseUrl,
        "telephone": "+1-530-537-2105",
        "priceRange": "$$"
      },
      Event: {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": "Fitness Class",
        "startDate": new Date().toISOString(),
        "endDate": new Date(Date.now() + 3600000).toISOString(),
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "eventStatus": "https://schema.org/EventScheduled",
        "location": {
          "@type": "Place",
          "name": "Lord's Gym",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "258 Elm Ave",
            "addressLocality": "Auburn",
            "addressRegion": "CA",
            "postalCode": "95603"
          }
        }
      },
      Product: {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Product Name",
        "description": "Product description",
        "image": "",
        "offers": {
          "@type": "Offer",
          "price": "0.00",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        }
      },
      Article: {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Article Title",
        "author": {
          "@type": "Organization",
          "name": "Lord's Gym"
        },
        "datePublished": new Date().toISOString(),
        "dateModified": new Date().toISOString()
      }
    };

    setSchemaJson(JSON.stringify(schemas[schemaType], null, 2));
  };

  const handleSave = () => {
    try {
      const parsed = JSON.parse(schemaJson);
      if (onSave) {
        onSave(parsed);
      }
      showSuccess('Schema markup saved successfully!');
    } catch (error) {
      showError('Invalid JSON. Please check your schema markup.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold dark:text-white">Schema.org Markup Editor</h3>
        <Button size="sm" variant="outline" onClick={generateDefaultSchema}>
          Generate Default
        </Button>
      </div>

      <div>
        <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Schema Type</label>
        <select
          value={schemaType}
          onChange={(e) => {
            setSchemaType(e.target.value as any);
            setSchemaJson('');
          }}
          className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
        >
          <option value="Organization">Organization</option>
          <option value="LocalBusiness">Local Business</option>
          <option value="Event">Event</option>
          <option value="Product">Product</option>
          <option value="Article">Article</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Schema JSON</label>
        <textarea
          value={schemaJson}
          onChange={(e) => setSchemaJson(e.target.value)}
          rows={15}
          className="w-full p-2 border rounded font-mono text-sm dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
          placeholder='{"@context": "https://schema.org", ...}'
        />
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Enter valid JSON-LD schema markup. Use "Generate Default" to start with a template.
        </p>
      </div>

      <div className="flex gap-2">
        <Button variant="brand" onClick={handleSave}>
          Save Schema Markup
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.textContent = schemaJson;
            document.head.appendChild(script);
            showSuccess('Schema markup added to page!');
          }}
        >
          Preview on Page
        </Button>
      </div>
    </div>
  );
};

export default SchemaMarkupEditor;
