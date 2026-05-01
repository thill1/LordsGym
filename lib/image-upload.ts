import { supabase } from './supabase';
import imageCompression from 'browser-image-compression';

const PRODUCT_IMAGES_FOLDER = 'products';

// Max dimensions and size for product images.
// iPhone photos are 4032×3024 @ 3–8 MB — way too large for a product card.
const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.5,         // 500 KB max after compression
  maxWidthOrHeight: 1200, // Never larger than 1200px on any side
  useWebWorker: true,
  fileType: 'image/jpeg', // Always output JPEG for broad browser support
};

/**
 * Convert a HEIC/HEIF file (iPhone default format) to JPEG.
 * Chrome and Firefox cannot render HEIC natively — only Safari can.
 * Returns the original file unchanged if it is not HEIC/HEIF.
 */
async function convertHeicToJpeg(file: File): Promise<File> {
  const isHeic =
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    file.name.toLowerCase().endsWith('.heic') ||
    file.name.toLowerCase().endsWith('.heif');

  if (!isHeic) return file;

  try {
    const heic2any = (await import('heic2any')).default;
    const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 });
    const blob = Array.isArray(converted) ? converted[0] : converted;
    const jpegName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
    return new File([blob], jpegName, { type: 'image/jpeg' });
  } catch (err) {
    console.warn('HEIC conversion failed, uploading original:', err);
    return file;
  }
}

/**
 * Prepare a product image for upload:
 * 1. Convert HEIC → JPEG (iPhone compatibility)
 * 2. Resize + compress to max 1200px / 500 KB (egress + storage cost)
 */
async function prepareImage(file: File): Promise<File> {
  const converted = await convertHeicToJpeg(file);
  try {
    const compressed = await imageCompression(converted, COMPRESSION_OPTIONS);
    // imageCompression returns a Blob — wrap in File to preserve name
    return new File([compressed], converted.name, { type: 'image/jpeg' });
  } catch (err) {
    console.warn('Image compression failed, uploading converted file:', err);
    return converted;
  }
}

export async function uploadProductImage(file: File): Promise<string | null> {
  if (!file) return null;

  try {
    const prepared = await prepareImage(file);

    // Generate unique filename with timestamp; always .jpg after processing
    const timestamp = Date.now();
    const baseName = prepared.name.replace(/[^a-zA-Z0-9.-]/g, '_').slice(-50);
    const filename = `${timestamp}-${baseName}`;
    const filePath = `${PRODUCT_IMAGES_FOLDER}/${filename}`;

    const { data, error } = await supabase.storage
      .from('media')
      .upload(filePath, prepared, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/jpeg',
      });

    if (error) {
      console.error('Image upload error:', error);
      return null;
    }

    if (!data) return null;

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
