import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export const useHealth = () =>
  useQuery({
    queryKey: ['health'],
    queryFn: () => api.get<{ status: string }>('/health'),
    refetchInterval: 30000,
  });

export const useBuckets = () =>
  useQuery({
    queryKey: ['buckets'],
    queryFn: () => api.get<string[]>('/storage/buckets'),
    staleTime: Infinity,
  });
