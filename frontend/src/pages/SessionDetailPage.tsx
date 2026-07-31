import { useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MonitorPlay, Pencil, Plus, Trash2, Upload, X, Check } from 'lucide-react';
import { useSession, useRealtimeSync } from '@/hooks/useSessions';
import {
  useSessionTables,
  useCreateTable,
  useRenameTable,
  useDeleteTable,
} from '@/hooks/useSessionTables';
import { storageService, UploadProgress } from '@/services/storage';
import { api } from '@/services/api';
import { formatMoney, formatDate, formatDuration } from '@/utils/format';
import { LiveCapturePanel } from '@/components/LiveCapturePanel';
import type { SessionTable } from '@poker/shared';

/** Card de mesa com upload de vídeo e renomeação inline. */
function TableCard({ table }: { table: SessionTable }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(table.name);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const rename = useRenameTable(table.sessionId);
  const remove = useDeleteTable(table.sessionId);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    setProgress(null);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `sessions/${table.sessionId}/${table.id}/${Date.now()}_${safeName}`;
      const publicUrl = await storageService.uploadWithProgress(
        'videos',
        path,
        file,
        setProgress
      );
      await api.post('/storage/register', {
        bucket: 'videos',
        path,
        filename: file.name,
        mimeType: file.type || 'video/mp4',
        sizeBytes: file.size,
        sessionId: table.sessionId,
        sessionTableId: table.id,
        type: 'VIDEO',
        status: 'READY',
        metadata: { publicUrl },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha no upload');
    } finally {
      setUploading(false);
      setProgress(null);
    }
  }

  function handleRename() {
    if (name.trim() && name.trim() !== table.name) {
      rename.mutate({ id: table.id, name: name.trim() });
    }
    setEditing(false);
  }

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent-400">
            <MonitorPlay size={18} />
          </div>
          <div>
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input !py-1 !text-sm"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                />
                <button
                  onClick={handleRename}
                  className="rounded-lg bg-success/20 p-1.5 text-success"
                  aria-label="Salvar nome"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => {
                    setName(table.name);
                    setEditing(false);
                  }}
                  className="rounded-lg bg-surface-800 p-1.5 text-slate-400"
                  aria-label="Cancelar"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <h3 className="font-semibold text-white">{table.name}</h3>
            )}
            <p className="text-xs text-slate-500">
              {table.videoCount} vídeo{table.videoCount === 1 ? '' : 's'} •{' '}
              <span
                className={
                  table.status === 'READY'
                    ? 'text-success'
                    : table.status === 'PROCESSING'
                      ? 'text-warning'
                      : 'text-slate-500'
                }
              >
                {table.status}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-surface-800 hover:text-white"
              aria-label="Renomear mesa"
            >
              <Pencil size={14} />
            </button>
          )}
          <button
            onClick={() => remove.mutate(table.id)}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-danger/20 hover:text-danger"
            aria-label="Remover mesa"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="mt-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="btn-ghost w-full"
        >
          <Upload size={16} />
          {uploading ? 'Enviando vídeo...' : 'Importar vídeo desta mesa'}
        </button>

        {uploading && progress && (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs text-slate-400">
              <span>Enviando para o Supabase Storage</span>
              <span>{progress.percent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-800">
              <motion.div
                className="h-full bg-accent"
                animate={{ width: `${progress.percent}%` }}
                transition={{ ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {error && (
          <p className="mt-3 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        {table.uploads && table.uploads.length > 0 && (
          <ul className="mt-4 space-y-2">
            {table.uploads.map((upload) => (
              <li
                key={upload.id}
                className="flex items-center justify-between rounded-lg border border-surface-800 bg-surface-925 px-3 py-2 text-sm"
              >
                <span className="truncate text-slate-300">{upload.filename}</span>
                <span className="ml-2 shrink-0 text-xs text-slate-500">
                  {(Number(upload.sizeBytes) / 1024 / 1024).toFixed(1)} MB
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** Detalhes da sessão: mesas, vídeos e organização. */
export default function SessionDetailPage() {
  const { id = '' } = useParams();
  const { data: session, isLoading } = useSession(id);
  const { data: tables } = useSessionTables(id);
  const createTable = useCreateTable(id);

  useRealtimeSync('sessions', ['sessions', 'detail', id]);
  useRealtimeSync('session_tables', ['session-tables', id]);

  if (isLoading) {
    return <div className="card h-40 animate-pulse" />;
  }

  if (!session) {
    return (
      <div className="space-y-4">
        <Link to="/sessions" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft size={16} /> Voltar
        </Link>
        <p className="text-slate-400">Sessão não encontrada.</p>
      </div>
    );
  }

  const profit = Number(session.profitLoss);

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/sessions"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} /> Voltar para Sessões
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{session.title}</h1>
            {session.isLive && (
              <span className="flex items-center gap-1 rounded-full border border-success/40 bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" /> AO VIVO
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {session.stakes && <span className="mr-2 rounded bg-surface-800 px-1.5 py-0.5 font-mono text-slate-300">{session.stakes}</span>}
            {formatDate(session.startedAt)}
            {session.location ? ` • ${session.location}` : ''}
          </p>
        </div>
        <div className={`text-right text-2xl font-bold ${profit > 0 ? 'text-success' : profit < 0 ? 'text-danger' : 'text-slate-400'}`}>
          {profit >= 0 ? '+' : ''}
          {formatMoney(profit)}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-xs text-slate-500">Buy-in</p>
          <p className="mt-1 font-semibold text-white">{formatMoney(session.buyIn)}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-slate-500">Duração</p>
          <p className="mt-1 font-semibold text-white">{formatDuration(session.durationMinutes)}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-slate-500">Mãos</p>
          <p className="mt-1 font-semibold text-white">{session.handsPlayed}</p>
        </div>
      </div>

      <LiveCapturePanel
        sessionId={id}
        tables={tables ?? []}
        stakes={session.stakes}
      />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Mesas</h2>
          <p className="text-sm text-slate-500">
            Adicione uma mesa por janela do jogo aberta na sessão
          </p>
        </div>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => createTable.mutate(undefined)}
          disabled={createTable.isPending}
        >
          <Plus size={16} />
          {createTable.isPending ? 'Adicionando...' : 'Adicionar mesa'}
        </button>
      </div>

      <AnimatePresence>
        {tables && tables.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {tables.map((table) => (
              <motion.div
                key={table.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <TableCard table={table} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-surface-800 bg-surface-925/50 px-8 py-12 text-center">
            <div className="mb-3 text-2xl text-slate-600">🃏</div>
            <h3 className="font-semibold text-white">Nenhuma mesa adicionada</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
              Clique em "Adicionar mesa" para cada janela do PokerStars/WPT que você jogou.
              Depois importe o vídeo de cada mesa para revisão posterior.
            </p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
