import { PagePlaceholder } from '@/components/PagePlaceholder';

/** Replayer - reprodução das mãos (futuro). */
export default function ReplayerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Replayer</h1>
          <p className="text-sm text-slate-500">
            Reprodução e análise das mãos
          </p>
        </div>
      </div>
      <PagePlaceholder
        title="Replayer em construção"
        description="Aqui você reproduzirá cada mão passo a passo, com controles de velocidade, avanço automático e anotações ao vivo."
      />
    </div>
  );
}
