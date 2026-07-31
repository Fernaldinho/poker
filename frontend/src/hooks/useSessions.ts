import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { api } from '@/services/api';
import { realtimeService, RealtimeTable } from '@/services/realtime';
import { useEffect } from 'react';
import type { Session } from '@poker/shared';

const SESSION_KEYS = {
  all: ['sessions'] as const,
  list: (params: Record<string, unknown>) => ['sessions', 'list', params] as const,
  detail: (id: string) => ['sessions', 'detail', id] as const,
};

export function useSessions(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: SESSION_KEYS.list(params),
    queryFn: async () => {
      const qs = new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)])
      ).toString();
      return api.get(`/sessions${qs ? `?${qs}` : ''}`);
    },
    placeholderData: (prev) => prev,
  });
}

export function useSession(id: string, options?: UseQueryOptions<Session>) {
  return useQuery({
    queryKey: SESSION_KEYS.detail(id),
    queryFn: () => api.get<Session>(`/sessions/${id}`),
    enabled: Boolean(id),
    ...options,
  });
}

/** Cria sessão e invalida cache de listas. */
export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/sessions', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SESSION_KEYS.all }),
  });
}

/** Atualiza sessão ao vivo e invalida cache. */
export function useUpdateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.patch(`/sessions/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: SESSION_KEYS.all });
      queryClient.invalidateQueries({ queryKey: SESSION_KEYS.detail(id) });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/sessions/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SESSION_KEYS.all }),
  });
}

/**
 * Hook de Realtime: mantém query atualizada ao vivo.
 * Qualquer INSERT/UPDATE/DELETE na tabela invalida a query.
 */
export function useRealtimeSync(table: RealtimeTable, queryKey: readonly unknown[]) {
  const queryClient = useQueryClient();

  useEffect(() => {
    return realtimeService.on(table, (payload) => {
      console.debug(`[realtime] ${payload.eventType} em ${payload.table}`, payload.new);
      queryClient.invalidateQueries({ queryKey });
    });
  }, [table, queryClient, JSON.stringify(queryKey)]);
}
