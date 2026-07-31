import { PagePlaceholder } from '@/components/PagePlaceholder';
import { useRealtimeSync } from '@/hooks/useSessions';

/** Dashboard - visão geral das sessões e estatísticas rápidas. */
export default function DashboardPage() {
  useRealtimeSync('sessions', ['sessions']);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-slate-500">
            Visão geral da sua evolução no poker
          </p>
        </div>
      </div>
      <PagePlaceholder
        title="Dashboard em construção"
        description="Aqui aparecerão gráficos de lucro, VPIP/PFR, estatísticas por sessão e indicadores de desempenho - atualizados ao vivo conforme você joga."
      />
    </div>
  );
}
