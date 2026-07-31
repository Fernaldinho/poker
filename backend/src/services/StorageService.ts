import { supabase } from '../storage/supabase';
import { config } from '../config';
import { UploadRepository } from '../repositories';
import { BadRequestError, NotFoundError } from '../utils/AppError';

export interface StorageUploadInput {
  bucket: string;
  path: string;
  file: Buffer;
  contentType: string;
  filename: string;
  sessionId?: string;
  handId?: string;
  type?: string;
}

/**
 * Serviço de Storage: comunicação com o Supabase Storage
 * e registro dos uploads na tabela `uploads`.
 */
export class StorageService {
  private repository = new UploadRepository();

  private validBuckets = new Set([
    config.storage.uploads,
    config.storage.videos,
    config.storage.images,
    config.storage.thumbnails,
    config.storage.sessions,
    config.storage.reports,
    config.storage.imports,
  ]);

  async upload(input: StorageUploadInput): Promise<string> {
    if (!this.validBuckets.has(input.bucket)) {
      throw new BadRequestError(`Bucket inválido: ${input.bucket}`);
    }

    const { error } = await supabase.storage
      .from(input.bucket)
      .upload(input.path, input.file, {
        contentType: input.contentType,
        upsert: true,
      });

    if (error) {
      throw new BadRequestError(`Falha no upload: ${error.message}`);
    }

    await this.repository.create({
      bucket: input.bucket,
      path: input.path,
      filename: input.filename,
      mimeType: input.contentType,
      sizeBytes: input.file.length,
      type: input.type ?? 'VIDEO',
      status: 'READY',
      ...(input.sessionId ? { sessionId: input.sessionId } : {}),
      ...(input.handId ? { handId: input.handId } : {}),
    });

    return this.getPublicUrl(input.bucket, input.path);
  }

  async getPublicUrl(bucket: string, path: string): Promise<string> {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async createSignedUrl(bucket: string, path: string, expiresIn = 3600): Promise<string> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);
    if (error) throw new BadRequestError(`Falha ao gerar URL assinada: ${error.message}`);
    return data.signedUrl;
  }

  async delete(bucket: string, path: string): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw new BadRequestError(`Falha ao remover arquivo: ${error.message}`);
  }

  async listBySession(sessionId: string) {
    return this.repository.findAll({ where: { sessionId }, orderBy: { createdAt: 'desc' } });
  }

  async getUpload(id: string) {
    const upload = await this.repository.findById(id);
    if (!upload) throw new NotFoundError('Upload não encontrado');
    return upload;
  }
}
