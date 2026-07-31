import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config';

/**
 * Cliente do Supabase (PostgreSQL + Storage + Realtime).
 * Usa a service_role key: acesso completo server-side.
 */
const globalForSupabase = globalThis as unknown as { supabase?: SupabaseClient };

export const supabase: SupabaseClient =
  globalForSupabase.supabase ??
  createClient(config.supabase.url, config.supabase.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForSupabase.supabase = supabase;
}

export async function verifySupabaseConnection(): Promise<void> {
  const { data, error } = await supabase.storage.listBuckets();
  if (error) {
    throw new Error(`Falha ao conectar no Supabase Storage: ${error.message}`);
  }
  console.log('[supabase] Conexão estabelecida - buckets: ' + data?.length);
}
