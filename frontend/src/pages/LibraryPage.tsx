import { PagePlaceholder } from '@/components/PagePlaceholder';

/** Biblioteca - mãos, vídeos e materiais de estudo. */
export default function LibraryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Biblioteca</h1>
          <p className="text-sm text-slate-500">
            Mãos, vídeos e materiais salvos
          </p>
        </div>
      </div>
      <PagePlaceholder
        title="Biblioteca em construção"
        description="Aqui ficará seu acervo: mãos importadas, vídeos de estudo, imagens de mesas e relatórios organizados por tags."
      />
    </div>
  );
}
