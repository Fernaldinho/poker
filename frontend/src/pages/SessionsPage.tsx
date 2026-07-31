import { PagePlaceholder } from '@/components/PagePlaceholder';
import { useRealtimeSync } from '@/hooks/useSessions';

/** Sessões - lista e detalhes das sessões de poker. */
export default function SessionsPage() {
  useRealtimeSync('sessions', ['sessions']);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sessões</h1>
          <p className="text-sm text-slate-500">
            Histórico completo de partidas
          </p>
        </div>
        <button type="button" className="btn-primary">
          Nova sessão
        </button>
      </div>
      <PagePlaceholder
        title="Sessões em construção"
        description="Aqui você acompanhará suas sessões ao vivo, com status em tempo real, uploads de vídeos, mãos jogadas e resultado financeiro."
      />
    </div>
  );
}
