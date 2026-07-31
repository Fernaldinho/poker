import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { SessionTable } from '@poker/shared';

const TABLE_KEYS = {
  all: (sessionId: string) => ['session-tables', sessionId] as const,
};

/** Lista mesas de uma sessão. */
export function useSessionTables(sessionId: string) {
  return useQuery({
    queryKey: TABLE_KEYS.all(sessionId),
    queryFn: () => api.get<SessionTable[]>(`/sessions/${sessionId}/tables`),
    enabled: Boolean(sessionId),
  });
}

/** Cria uma nova mesa na sessão. */
export function useCreateTable(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name?: string) => api.post(`/sessions/${sessionId}/tables`, { name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TABLE_KEYS.all(sessionId) }),
  });
}

/** Renomeia uma mesa. */
export function useRenameTable(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      api.patch(`/session-tables/${id}`, { name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TABLE_KEYS.all(sessionId) }),
  });
}

/** Remove uma mesa. */
export function useDeleteTable(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/session-tables/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TABLE_KEYS.all(sessionId) }),
  });
}
