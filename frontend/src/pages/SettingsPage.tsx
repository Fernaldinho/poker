import { PagePlaceholder } from '@/components/PagePlaceholder';

/** Configurações - preferências do app. */
export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Configurações</h1>
          <p className="text-sm text-slate-500">
            Preferências do aplicativo
          </p>
        </div>
      </div>
      <PagePlaceholder
        title="Configurações em construção"
        description="Aqui você ajustará tema, velocidades do replayer, limites de upload, integrações e comportamento de importação."
      />
    </div>
  );
}
