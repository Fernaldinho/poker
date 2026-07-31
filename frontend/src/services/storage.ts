import { supabase } from './supabase';

export interface UploadResult {
  url: string;
  bucket: string;
  path: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
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

  /**
   * Upload direto com barra de progresso (XMLHttpRequest).
   * Ideal para vídeos grandes.
   */
  uploadWithProgress(
    bucket: string,
    path: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const baseUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '');
      const url = `${baseUrl}/storage/v1/object/${bucket}/${encodeURIComponent(path)}`;
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url, true);
      xhr.setRequestHeader('Authorization', `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress({
            loaded: e.loaded,
            total: e.total,
            percent: Math.round((e.loaded / e.total) * 100),
          });
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const { data } = supabase.storage.from(bucket).getPublicUrl(path);
          resolve(data.publicUrl);
        } else {
          reject(new Error(`Upload falhou (HTTP ${xhr.status})`));
        }
      };

      xhr.onerror = () => reject(new Error('Falha de rede no upload'));
      xhr.send(file);
    });
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
    extra?: {
      sessionId?: string;
      handId?: string;
      sessionTableId?: string;
      type?: string;
    }
  ): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);
    formData.append('path', path);
    if (extra?.sessionId) formData.append('sessionId', extra.sessionId);
    if (extra?.handId) formData.append('handId', extra.handId);
    if (extra?.sessionTableId) formData.append('sessionTableId', extra.sessionTableId);
    if (extra?.type) formData.append('type', extra.type);

    const res = await fetch(
      `${import.meta.env.VITE_API_URL ?? 'http://localhost:3333'}/api/storage/upload`,
      { method: 'POST', body: formData }
    );
    const json = (await res.json().catch(() => null)) as {
      success: boolean;
      data?: UploadResult;
      error?: string;
    };
    if (!res.ok || !json?.success) {
      throw new Error(json?.error ?? `Erro HTTP ${res.status}`);
    }
    return json.data as UploadResult;
  },
};
