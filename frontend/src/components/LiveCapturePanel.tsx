import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MonitorPlay,
  StopCircle,
  Video,
  Radio,
  AlertTriangle,
  Camera,
  CheckCircle2,
} from 'lucide-react';
import type { PokerSuggestion } from '@poker/shared';
import { api } from '@/services/api';
import { storageService } from '@/services/storage';
import type { SessionTable } from '@poker/shared';

const FRAME_INTERVAL_MS = 4000;

type CaptureState = 'idle' | 'capturing' | 'recording';
type SuggestionState = 'idle' | 'analyzing' | 'ready' | 'error';

/**
 * Captura ao vivo da mesa (compartilhamento de tela do navegador),
 * análise contínua com IA e gravação do vídeo para o Supabase.
 */
export function LiveCapturePanel({
  sessionId,
  tables,
  stakes,
  heroCards,
}: {
  sessionId: string;
  tables: SessionTable[];
  stakes?: string | null;
  heroCards?: string;
}) {
  const [state, setState] = useState<CaptureState>('idle');
  const [sugState, setSugState] = useState<SuggestionState>('idle');
  const [suggestion, setSuggestion] = useState<PokerSuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<string | null>(null);
  const [targetTableId, setTargetTableId] = useState<string>('');
  const [recording, setRecording] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyzingRef = useRef(false);

  useEffect(() => {
    if (tables.length > 0 && !targetTableId) {
      setTargetTableId(tables[0].id);
    }
  }, [tables, targetTableId]);

  const stopCapture = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setState('idle');
    setRecording(false);
    setSugState('idle');
    setSuggestion(null);
  }, []);

  useEffect(() => () => stopCapture(), [stopCapture]);

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.7).split(',')[1] ?? null;
  }, []);

  const runAnalysis = useCallback(async () => {
    if (analyzingRef.current || state === 'idle') return;
    analyzingRef.current = true;
    setSugState('analyzing');
    try {
      const frame = captureFrame();
      if (!frame) {
        setSugState(sugState === 'ready' ? 'ready' : 'idle');
        return;
      }
      const { data } = await api.post<{ data: PokerSuggestion }>('/ai/analyze', {
        imageBase64: frame,
        mimeType: 'image/jpeg',
        context: {
          stakes,
          heroCards,
          notes: `Mesa alvo: ${
            tables.find((t) => t.id === targetTableId)?.name ?? ''
          }`,
        },
      });
      setSuggestion(data);
      setSugState('ready');
      setError(null);
      setLastAnalysis(new Date().toLocaleTimeString('pt-BR'));
    } catch (e) {
      setSugState('error');
      setError(e instanceof Error ? e.message : 'Falha na análise');
    } finally {
      analyzingRef.current = false;
    }
  }, [captureFrame, state, sugState, stakes, heroCards, tables, targetTableId]);

  async function startCapture() {
    setError(null);
    setSuggestion(null);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 15 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setState('capturing');

      stream.getVideoTracks()[0].addEventListener('ended', () => {
        stopCapture();
      });

      setSugState('idle');
      intervalRef.current = setInterval(runAnalysis, FRAME_INTERVAL_MS);
      setTimeout(runAnalysis, 800);
    } catch (e) {
      setError(
        e instanceof Error && e.name === 'NotAllowedError'
          ? 'Captura cancelada. Selecione a janela da WPT/PokerStars.'
          : 'Não foi possível capturar a tela.'
      );
    }
  }

  async function toggleRecording() {
    if (recording) {
      recorderRef.current?.stop();
      setRecording(false);
      return;
    }

    const stream = streamRef.current;
    if (!stream) return;

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';
    const recorder = new MediaRecorder(stream, { mimeType });
    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      if (blob.size === 0) return;

      try {
        setUploadProgress(0);
        const filename = `sessao_ao_vivo_${new Date().toISOString().replace(/[:.]/g, '-')}.webm`;
        const path = `sessions/${sessionId}/${targetTableId || 'sem-mesa'}/${filename}`;
        const publicUrl = await storageService.uploadWithProgress(
          'videos',
          path,
          new File([blob], filename, { type: mimeType }),
          (p) => setUploadProgress(p.percent)
        );
        await api.post('/storage/register', {
          bucket: 'videos',
          path,
          filename,
          mimeType,
          sizeBytes: blob.size,
          sessionId,
          sessionTableId: targetTableId || undefined,
          type: 'VIDEO',
          status: 'READY',
          metadata: { publicUrl, source: 'live-capture' },
        });
        setError(null);
      } catch (e) {
        setError(
          e instanceof Error
            ? `Vídeo gravado mas não foi possível salvar: ${e.message}`
            : 'Erro ao salvar vídeo'
        );
      } finally {
        setUploadProgress(null);
      }
    };
    recorder.start();
    recorderRef.current = recorder;
    setRecording(true);
  }

  const actionColor =
    suggestion?.action === 'FOLD'
      ? 'text-danger'
      : suggestion?.action === 'RAISE'
        ? 'text-success'
        : 'text-accent-400';

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-surface-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              state !== 'idle'
                ? 'bg-danger/15 text-danger'
                : 'bg-accent/15 text-accent-400'
            }`}
          >
            <MonitorPlay size={18} />
          </div>
          <div>
            <h2 className="font-semibold text-white">Captura ao vivo</h2>
            <p className="text-xs text-slate-500">
              Compartilhe a janela da mesa e receba sugestões de jogada
            </p>
          </div>
        </div>

        {state !== 'idle' && (
          <span className="flex items-center gap-1.5 rounded-full border border-danger/40 bg-danger/10 px-2.5 py-1 text-xs font-medium text-danger">
            <Radio size={12} className="animate-pulse" />
            {recording ? 'GRAVANDO' : 'CAPTURANDO'}
          </span>
        )}
      </div>

      <div className="grid gap-4 p-5 lg:grid-cols-[1.4fr_1fr]">
        <div>
          {state === 'idle' ? (
            <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-surface-800 bg-surface-925/50 p-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-xl text-accent-400">
                <Camera size={20} />
              </div>
              <h3 className="font-semibold text-white">Iniciar captura ao vivo</h3>
              <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                Você vai escolher a janela da WPT/PokerStars. O app analisa a mesa
                a cada 4s e sugere fold, call ou raise.
              </p>
              <button type="button" className="btn-primary mt-4" onClick={startCapture}>
                <Video size={16} />
                Compartilhar tela e começar
              </button>
              {tables.length > 0 && (
                <label className="mt-3 flex items-center gap-2 text-sm text-slate-400">
                  Gravar vídeo em:
                  <select
                    value={targetTableId}
                    onChange={(e) => setTargetTableId(e.target.value)}
                    className="input !py-1 !text-sm"
                  >
                    {tables.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-xl border border-surface-800 bg-black">
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  className="max-h-[320px] w-full object-contain"
                />
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className={`btn-ghost ${recording ? '!border-danger/50 !text-danger' : ''}`}
                  onClick={toggleRecording}
                >
                  {recording ? <StopCircle size={16} /> : <Video size={16} />}
                  {recording
                    ? 'Parar gravação'
                    : uploadProgress !== null
                      ? `Salvando ${uploadProgress}%`
                      : 'Gravar esta mesa'}
                </button>
                <button
                  type="button"
                  className="btn-ghost !text-danger"
                  onClick={stopCapture}
                >
                  <StopCircle size={16} />
                  Encerrar captura
                </button>
                {lastAnalysis && (
                  <span className="text-xs text-slate-500">
                    Última análise: {lastAnalysis}
                  </span>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Sugestão de jogada
            </h3>
            {sugState === 'analyzing' && (
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                analisando mesa...
              </span>
            )}
          </div>

          <AnimatePresence mode="wait">
            {suggestion && sugState === 'ready' ? (
              <motion.div
                key="sug"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex-1 rounded-xl border border-surface-800 bg-surface-925 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Ação sugerida
                    </p>
                    <p className={`text-4xl font-black ${actionColor}`}>
                      {suggestion.action}
                    </p>
                    {suggestion.amount && (
                      <p className="mt-1 font-mono text-sm text-slate-300">
                        {suggestion.amount}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Confiança</p>
                    <p className="text-xl font-bold text-white">
                      {Math.round(suggestion.confidence * 100)}%
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-slate-300">
                  {suggestion.reason || 'Sem explicação.'}
                </p>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-surface-800 pt-3 text-xs">
                  <span className="rounded bg-surface-800 px-2 py-1 text-slate-400">
                    {suggestion.table.street}
                  </span>
                  {suggestion.table.pot && (
                    <span className="rounded bg-surface-800 px-2 py-1 text-slate-400">
                      Pot {suggestion.table.pot}
                    </span>
                  )}
                  {suggestion.table.position && (
                    <span className="rounded bg-surface-800 px-2 py-1 text-slate-400">
                      {suggestion.table.position}
                    </span>
                  )}
                  {suggestion.table.heroCards?.map((c) => (
                    <span
                      key={c}
                      className="rounded bg-surface-800 px-2 py-1 font-mono text-white"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-surface-800 bg-surface-925/40 p-8 text-center"
              >
                <div className="space-y-2">
                  <p className="text-3xl">🎯</p>
                  <p className="text-sm text-slate-500">
                    {state === 'idle'
                      ? 'Inicie a captura para ver sugestões'
                      : sugState === 'error'
                        ? 'Erro na análise'
                        : 'Aguardando primeiro frame...'}
                  </p>
                  {sugState === 'error' && (
                    <p className="mx-auto max-w-xs text-xs text-warning">
                      Se apareceu "IA não configurada", adicione a chave gratuita em
                      backend/.env (GEMINI_API_KEY de aistudio.google.com/apikey) e
                      reinicie o backend.
                    </p>
                  )}
                  {state === 'capturing' && !recording && (
                    <p className="flex items-center justify-center gap-1.5 text-xs text-success">
                      <CheckCircle2 size={13} />
                      Captura ativa — análise automática a cada 4s
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
