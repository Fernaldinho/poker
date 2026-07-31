import { supabase } from './supabase';

const REALTIME_TABLES = [
  'sessions',
  'hands',
  'statistics',
  'uploads',
  'tables',
  'notes',
  'tags',
  'settings',
] as const;

export type RealtimeTable = (typeof REALTIME_TABLES)[number];

type RealtimePayload = {
  table: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Record<string, unknown>;
  old: Record<string, unknown>;
};

type Listener = (payload: RealtimePayload) => void;

const listeners = new Map<string, Set<Listener>>();

/**
 * Serviço de Realtime: assina mudanças nas tabelas e
 * repassa eventos para componentes via on/off.
 */
class RealtimeService {
  private channels: Array<ReturnType<typeof supabase.channel>> = [];
  private started = false;

  /** Inicia as subscriptions (chamado uma vez no bootstrap). */
  start(): void {
    if (this.started) return;
    this.started = true;

    if (import.meta.env.VITE_ENABLE_REALTIME !== 'true') {
      console.warn('[realtime] Desabilitado via VITE_ENABLE_REALTIME');
      return;
    }

    const channel = supabase.channel('poker-realtime');
    for (const table of REALTIME_TABLES) {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          const typed = payload as unknown as RealtimePayload;
          this.dispatch(table, typed);
        }
      );
    }

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('[realtime] Conectado - atualizações ao vivo ativas');
      }
    });

    this.channels.push(channel);
  }

  /** Assina eventos de uma tabela. Retorna função de unsubscribe. */
  on(table: RealtimeTable, listener: Listener): () => void {
    if (!listeners.has(table)) listeners.set(table, new Set());
    listeners.get(table)!.add(listener);
    return () => this.off(table, listener);
  }

  off(table: RealtimeTable, listener: Listener): void {
    listeners.get(table)?.delete(listener);
  }

  private dispatch(table: string, payload: RealtimePayload): void {
    listeners.get(table)?.forEach((listener) => listener(payload));
  }

  /** Encerra todas as subscriptions. */
  stop(): void {
    this.channels.forEach((channel) => supabase.removeChannel(channel));
    this.channels = [];
    this.started = false;
    listeners.clear();
  }
}

export const realtimeService = new RealtimeService();
