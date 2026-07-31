import type { ApiResponse, PaginatedResult, Session } from '@poker/shared';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';

/** Cliente HTTP tipado para a API backend. */
class ApiClient {
  private baseUrl = API_URL;

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
      ...options,
    });

    const body = (await res.json().catch(() => null)) as ApiResponse<T> | null;

    if (!res.ok) {
      throw new Error(body?.error ?? `Erro HTTP ${res.status}`);
    }
    return (body?.data ?? body) as T;
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>(path);
  }

  post<T>(path: string, data?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: JSON.stringify(data ?? {}),
    });
  }

  patch<T>(path: string, data: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' });
  }
}

export const api = new ApiClient();

// --- Tipos de resposta usados nas páginas ---

export interface SessionListResponse {
  success: boolean;
  data: PaginatedResult<Session>;
}

export interface SessionDetailResponse {
  success: boolean;
  data: Session;
}
