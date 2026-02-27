// Utility to replace image URLs across the site

import { supabase, isSupabaseConfigured } from './supabase';

export interface ImageReplacement {
  oldUrl: string;
  newUrl: string;
  affectedTables: string[];
}

/**
 * Replace image URL across multiple tables
 */
export const replaceImageUrl = async (
  oldUrl: string,
  newUrl: string,
  tables: string[] = ['products', 'pages', 'home_content', 'outreach_content', 'media']
): Promise<{ success: boolean; affectedRows: number; errors: string[] }> => {
  if (!isSupabaseConfigured()) {
    return { success: false, affectedRows: 0, errors: ['Supabase not configured'] };
  }

  const errors: string[] = [];
  let totalAffected = 0;

  try {
    // Replace in products table
    if (tables.includes('products')) {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, image');

      if (!productsError && products) {
        for (const product of products) {
          if (product.image && product.image.includes(oldUrl)) {
            const updatedImage = product.image.replace(oldUrl, newUrl);
            const { error } = await supabase
              .from('products')
              .update({ image: updatedImage })
              .eq('id', product.id);
            
            if (error) {
              errors.push(`Product ${product.id}: ${error.message}`);
            } else {
              totalAffected++;
            }
          }
        }
      }
    }

    // Replace in pages table (JSONB content)
    if (tables.includes('pages')) {
      const { data: pages, error: pagesError } = await supabase
        .from('pages')
        .select('id, content, meta_image');

      if (!pagesError && pages) {
        for (const page of pages) {
          let updated = false;
          const content = page.content || {};
          
          // Replace in meta_image
          if (page.meta_image && page.meta_image.includes(oldUrl)) {
            const updatedMetaImage = page.meta_image.replace(oldUrl, newUrl);
            const { error } = await supabase
              .from('pages')
              .update({ meta_image: updatedMetaImage })
              .eq('id', page.id);
            
            if (error) {
              errors.push(`Page ${page.id} meta_image: ${error.message}`);
            } else {
              updated = true;
            }
          }

          // Replace in JSONB content (recursive search)
          const replaceInObject = (obj: any): any => {
            if (typeof obj === 'string' && obj.includes(oldUrl)) {
              updated = true;
              return obj.replace(oldUrl, newUrl);
            }
            if (Array.isArray(obj)) {
              return obj.map(replaceInObject);
            }
            if (obj && typeof obj === 'object') {
              const result: any = {};
              for (const key in obj) {
                result[key] = replaceInObject(obj[key]);
              }
              return result;
            }
            return obj;
          };

          const updatedContent = replaceInObject(content);
          if (updated) {
            const { error } = await supabase
              .from('pages')
              .update({ content: updatedContent })
              .eq('id', page.id);
            
            if (error) {
              errors.push(`Page ${page.id} content: ${error.message}`);
            } else {
              totalAffected++;
            }
          }
        }
      }
    }

    // Replace in home_content (JSONB)
    if (tables.includes('home_content')) {
      const { data: homeContent, error: homeError } = await supabase
        .from('home_content')
        .select('id, hero');

      if (!homeError && homeContent && homeContent.length > 0) {
        const content = homeContent[0];
        const hero = content.hero || {};
        
        if (hero.backgroundImage && hero.backgroundImage.includes(oldUrl)) {
          const updatedHero = {
            ...hero,
            backgroundImage: hero.backgroundImage.replace(oldUrl, newUrl)
          };
          
          const { error } = await supabase
            .from('home_content')
            .update({ hero: updatedHero })
            .eq('id', content.id);
          
          if (error) {
            errors.push(`Home content: ${error.message}`);
          } else {
            totalAffected++;
          }
        }
      }
    }

    // Replace in outreach_content (JSONB images)
    if (tables.includes('outreach_content')) {
      const { data: outreachRows, error: outreachError } = await supabase
        .from('outreach_content')
        .select('id, images');

      if (!outreachError && outreachRows && outreachRows.length > 0) {
        const images = outreachRows[0].images || ({} as Record<string, string>);
        const keys = ['hero', 'trailer', 'outreach', 'prayer', 'hug', 'community'] as const;
        let updated = false;
        const newImages = { ...images };
        for (const key of keys) {
          const val = newImages[key];
          if (typeof val === 'string' && val.includes(oldUrl)) {
            newImages[key] = val.replace(oldUrl, newUrl);
            updated = true;
          }
        }
        if (updated) {
          const { error } = await supabase
            .from('outreach_content')
            .update({ images: newImages })
            .eq('id', outreachRows[0].id);
          if (error) {
            errors.push(`Outreach content: ${error.message}`);
          } else {
            totalAffected++;
          }
        }
      }
    }

    return {
      success: errors.length === 0,
      affectedRows: totalAffected,
      errors
    };
  } catch (error: any) {
    return {
      success: false,
      affectedRows: totalAffected,
      errors: [...errors, error.message]
    };
  }
};
