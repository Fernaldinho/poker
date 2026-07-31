import 'dotenv/config';

/**
 * Configuração centralizada da aplicação.
 * Lê variáveis de ambiente com defaults seguros.
 */
export const config = {
  env: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3333),
  isProduction: process.env.NODE_ENV === 'production',

  supabase: {
    url: process.env.SUPABASE_URL ?? '',
    anonKey: process.env.SUPABASE_ANON_KEY ?? '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  },

  storage: {
    uploads: process.env.STORAGE_BUCKET_UPLOADS ?? 'uploads',
    videos: process.env.STORAGE_BUCKET_VIDEOS ?? 'videos',
    images: process.env.STORAGE_BUCKET_IMAGES ?? 'images',
    thumbnails: process.env.STORAGE_BUCKET_THUMBNAILS ?? 'thumbnails',
    sessions: process.env.STORAGE_BUCKET_SESSIONS ?? 'sessions',
    reports: process.env.STORAGE_BUCKET_REPORTS ?? 'reports',
    imports: process.env.STORAGE_BUCKET_IMPORTS ?? 'imports',
    maxUploadSizeMb: Number(process.env.MAX_UPLOAD_SIZE_MB ?? 2048),
  },

  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY ?? '',
    zenApiKey: process.env.ZEN_API_KEY ?? '',
    model: process.env.AI_MODEL ?? 'gemini-3-flash',
    maxImageSizeMb: Number(process.env.AI_MAX_IMAGE_MB ?? 4),
  },
} as const;
