/**
 * Shared media upload: storage + media table.
 * Use from Media Library or Outreach (and other) editors so uploads are consistent and appear in the library.
 */
import { supabase } from './supabase';
import { isSupabaseConfigured } from './supabase';

const BUCKET = 'media';

export interface UploadResult {
  url: string;
  id?: string;
}

/**
 * Upload a file to storage and register it in the media table. Returns the public URL.
 * Fails if Supabase is not configured (call isSupabaseConfigured() first if you need a fallback).
 */
export async function uploadMediaFile(file: File): Promise<UploadResult> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const fileExt = file.name.split('.').pop() || 'bin';
  const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
  const filePath = `media/${fileName}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filePath, file);
  if (uploadError) {
    const msg = uploadError.message || String(uploadError);
    if (msg.includes('Bucket not found') || msg.includes('does not exist')) {
      throw new Error('Storage bucket "media" not found. Create it in Supabase Dashboard → Storage.');
    }
    if (msg.includes('row-level security') || msg.includes('policy')) {
      throw new Error('Storage policy denied upload. Ensure authenticated users have INSERT on storage.objects.');
    }
    throw uploadError;
  }

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

  const { data: inserted, error: dbError } = await supabase
    .from('media')
    .insert({
      filename: file.name,
      url: publicUrl,
      file_type: file.type,
      file_size: file.size,
      folder: null,
      tags: null,
      alt_text: null,
    })
    .select('id')
    .single();

  if (dbError) {
    const msg = dbError.message || String(dbError);
    if (msg.includes('row-level security')) {
      throw new Error('Not authenticated or insufficient permissions for media table.');
    }
    throw dbError;
  }

  return { url: publicUrl, id: inserted?.id };
}
