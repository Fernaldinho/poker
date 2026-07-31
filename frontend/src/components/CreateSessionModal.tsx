import { FormEvent, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useCreateSession } from '@/hooks/useSessions';

interface CreateSessionModalProps {
  open: boolean;
  onClose: () => void;
}

/** Modal de criação de sessão. */
export function CreateSessionModal({ open, onClose }: CreateSessionModalProps) {
  const createSession = useCreateSession();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const data = {
      title: String(form.get('title') ?? '').trim(),
      stakes: String(form.get('stakes') ?? '').trim() || undefined,
      buyIn: Number(form.get('buyIn')) || 0,
      location: String(form.get('location') ?? '').trim() || undefined,
      description: String(form.get('description') ?? '').trim() || undefined,
    };

    if (!data.title) {
      setError('O título é obrigatório');
      return;
    }

    createSession.mutate(data, {
      onSuccess: () => onClose(),
      onError: (err) => setError(err.message),
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.form
            initial={{ scale: 0.95, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 16 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-surface-800 bg-surface-900 p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Nova sessão</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-surface-800 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="mb-1.5 block text-sm text-slate-400">
                  Título *
                </label>
                <input
                  id="title"
                  name="title"
                  className="input"
                  placeholder="Ex: Cash Game NL50 - Sexta"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="stakes" className="mb-1.5 block text-sm text-slate-400">
                    Stakes
                  </label>
                  <input id="stakes" name="stakes" className="input" placeholder="Ex: NL50" />
                </div>
                <div>
                  <label htmlFor="buyIn" className="mb-1.5 block text-sm text-slate-400">
                    Buy-in (R$)
                  </label>
                  <input
                    id="buyIn"
                    name="buyIn"
                    type="number"
                    min="0"
                    step="0.01"
                    className="input"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="location" className="mb-1.5 block text-sm text-slate-400">
                  Local
                </label>
                <input id="location" name="location" className="input" placeholder="Online / Casa" />
              </div>

              <div>
                <label htmlFor="description" className="mb-1.5 block text-sm text-slate-400">
                  Descrição
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={2}
                  className="input resize-none"
                  placeholder="Observações rápidas..."
                />
              </div>

              {error && (
                <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-ghost">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createSession.isPending}
                  className="btn-primary"
                >
                  {createSession.isPending ? 'Criando...' : 'Criar sessão'}
                </button>
              </div>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
