import { supabase } from './supabase';
import type { ApiResponse } from '@poker/shared';

export interface UploadResult {
  url: string;
  bucket: string;
  path: string;
}

/**
 * Serviço de upload direto para o Supabase Storage.
 * Suporta buckets: uploads, videos, images, thumbnails, sessions, reports, imports.
 */
export const storageService = {
  /** Upload direto via Supabase Storage (anon). */
  async uploadToBucket(
    bucket: string,
    path: string,
    file: File,
    upsert = true
  ): Promise<string> {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert,
    });
    if (error) throw new Error(`Falha no upload: ${error.message}`);
    return data.path;
  },

  async getPublicUrl(bucket: string, path: string): Promise<string> {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  /** Upload via API backend (registra na tabela uploads). */
  async uploadViaApi(
    bucket: string,
    path: string,
    file: File,
    extra?: { sessionId?: string; handId?: string; type?: string }
  ): Promise<ApiResponse<UploadResult>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);
    formData.append('path', path);
    if (extra?.sessionId) formData.append('sessionId', extra.sessionId);
    if (extra?.handId) formData.append('handId', extra.handId);
    if (extra?.type) formData.append('type', extra.type);

    const res = await fetch(
      `${import.meta.env.VITE_API_URL ?? 'http://localhost:3333'}/api/storage/upload`,
      { method: 'POST', body: formData }
    );
    return (await res.json()) as ApiResponse<UploadResult>;
  },
};
