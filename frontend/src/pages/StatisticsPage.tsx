import { PagePlaceholder } from '@/components/PagePlaceholder';
import { useRealtimeSync } from '@/hooks/useSessions';

/** Estatísticas - gráficos e métricas agregadas (Recharts). */
export default function StatisticsPage() {
  useRealtimeSync('statistics', ['statistics']);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Estatísticas</h1>
          <p className="text-sm text-slate-500">
            Métricas e gráficos da sua evolução
          </p>
        </div>
      </div>
      <PagePlaceholder
        title="Estatísticas em construção"
        description="Aqui serão renderizados gráficos (Recharts): lucro acumulado, VPIP/PFR, folds, 3-bets e análise por posição."
      />
    </div>
  );
}
