import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Radio, Timer, Wallet } from 'lucide-react';
import type { Session } from '@poker/shared';
import { useSessions, useRealtimeSync } from '@/hooks/useSessions';
import { CreateSessionModal } from '@/components/CreateSessionModal';
import { formatMoney, formatDate, formatDuration } from '@/utils/format';

function SessionCard({ session }: { session: Session }) {
  const profit = Number(session.profitLoss);
  const isLive = session.isLive || session.status === 'LIVE';

  return (
    <Link to={`/sessions/${session.id}`}>
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-5 transition-colors hover:border-accent/50"
      >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold text-white">{session.title}</h3>
            {isLive && (
              <span className="flex items-center gap-1 rounded-full border border-success/40 bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                AO VIVO
              </span>
            )}
          </div>
          <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            {session.stakes && <span className="rounded bg-surface-800 px-1.5 py-0.5 font-mono text-slate-300">{session.stakes}</span>}
            <span>{formatDate(session.startedAt)}</span>
            {session.location && <span>• {session.location}</span>}
          </p>
        </div>
        <div
          className={`text-right text-lg font-bold ${
            profit > 0 ? 'text-success' : profit < 0 ? 'text-danger' : 'text-slate-400'
          }`}
        >
          {profit >= 0 ? '+' : ''}
          {formatMoney(profit)}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-5 border-t border-surface-800 pt-3 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <Wallet size={14} /> Buy-in {formatMoney(session.buyIn)}
        </span>
        <span className="flex items-center gap-1.5">
          <Timer size={14} /> {formatDuration(session.durationMinutes)}
        </span>
        <span className="flex items-center gap-1.5">
          <Play size={14} /> {session.handsPlayed} mãos
        </span>
        {isLive && (
          <span className="ml-auto flex items-center gap-1.5 text-success">
            <Radio size={14} /> Em andamento
          </span>
        )}
      </div>
      </motion.div>
    </Link>
  );
}

/** Sessões - lista e detalhes das sessões de poker. */
export default function SessionsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data, isLoading, isError } = useSessions({ page: 1, pageSize: 50 });
  useRealtimeSync('sessions', ['sessions']);

  const sessions = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sessões</h1>
          <p className="text-sm text-slate-500">Histórico completo de partidas</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setModalOpen(true)}>
          Nova sessão
        </button>
      </div>

      {isError && (
        <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          Não foi possível carregar as sessões. Verifique se a API está rodando.
        </p>
      )}

      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card h-28 animate-pulse bg-surface-900" />
          ))}
        </div>
      )}

      {!isLoading && sessions.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-800 bg-surface-925/50 px-8 py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-xl text-accent-400">
            ♠
          </div>
          <h2 className="font-semibold text-white">Nenhuma sessão ainda</h2>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Clique em "Nova sessão" para começar a registrar suas partidas.
          </p>
        </div>
      )}

      {sessions.length > 0 && (
        <div className="space-y-3">
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}

      <CreateSessionModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
