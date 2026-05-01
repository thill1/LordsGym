import { supabase } from './supabase';

const PRODUCT_IMAGES_FOLDER = 'products';

export async function uploadProductImage(file: File): Promise<string | null> {
  if (!file) return null;

  try {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').slice(-50);
    const filename = `${timestamp}-${cleanName}`;
    const filePath = `${PRODUCT_IMAGES_FOLDER}/${filename}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Image upload error:', error);
      return null;
    }

    if (!data) return null;

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Image upload exception:', error);
    return null;
  }
}

export async function deleteProductImage(imageUrl: string): Promise<boolean> {
  if (!imageUrl || !imageUrl.includes('/storage/')) return true;

  try {
    // Extract path from public URL
    const urlParts = imageUrl.split('/storage/v1/object/public/media/');
    if (urlParts.length !== 2) return true;

    const filePath = urlParts[1];
    const { error } = await supabase.storage
      .from('media')
      .remove([filePath]);

    if (error) {
      console.error('Image deletion error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Image deletion exception:', error);
    return false;
  }
}
