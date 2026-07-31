import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn('[supabase] Variáveis de ambiente ausentes - configure o .env');
}

/**
 * Cliente Supabase do frontend (anon key).
 * Usado para Storage (uploads) e Realtime (atualização ao vivo).
 */
export const supabase: SupabaseClient = createClient(url, anonKey, {
  auth: {
    persistSession: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
