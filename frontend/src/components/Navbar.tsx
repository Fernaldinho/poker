import { Bell, Search } from 'lucide-react';
import { useHealth } from '@/hooks/useApi';

/** Navbar superior com busca e status da API. */
export function Navbar() {
  const { data, isError } = useHealth();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-surface-800 bg-surface-950/80 px-6 backdrop-blur">
      <div className="relative flex-1 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar sessões, mãos, notas..."
          className="input pl-9"
        />
      </div>

      <div className="ml-auto flex items-center gap-4">
        <div
          className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${
            isError
              ? 'border-danger/40 bg-danger/10 text-danger'
              : data?.status === 'ok'
                ? 'border-success/40 bg-success/10 text-success'
                : 'border-warning/40 bg-warning/10 text-warning'
          }`}
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-current" />
          {isError ? 'API offline' : data?.status === 'ok' ? 'Ao vivo' : 'Conectando'}
        </div>
        <button
          type="button"
          aria-label="Notificações"
          className="btn-ghost !p-2.5"
        >
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
}
