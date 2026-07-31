/**
 * Tipos compartilhados entre frontend e backend.
 * Modelos espelham as tabelas do Supabase PostgreSQL.
 */

// ---------- ENUMs ----------

export type GameType = 'CASH_GAME' | 'TOURNAMENT' | 'SIT_AND_GO';

export type SessionStatus = 'LIVE' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED';

export type UploadType = 'VIDEO' | 'IMAGE' | 'THUMBNAIL' | 'REPORT' | 'IMPORT_FILE' | 'SESSION_DATA';

export type UploadStatus = 'PENDING' | 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED';

export type HandAnalysisStatus = 'PENDING' | 'PROCESSING' | 'ANALYZED' | 'FAILED';

// ---------- Entidades ----------

export interface Tag {
  id: string;
  name: string;
  color: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface PokerTable {
  id: string;
  name: string;
  description?: string | null;
  gameType: GameType;
  stakes?: string | null;
  maxPlayers: number;
  site?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  tableId?: string | null;
  title: string;
  description?: string | null;
  status: SessionStatus;
  isLive: boolean;
  startedAt: string;
  endedAt?: string | null;
  buyIn: number;
  cashOut: number;
  profitLoss: number;
  handsPlayed: number;
  durationMinutes: number;
  stakes?: string | null;
  location?: string | null;
  notesSummary?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Hand {
  id: string;
  sessionId: string;
  handNumber: number;
  handIdOriginal?: string | null;
  timestamp: string;
  players: number;
  positions: unknown[];
  cards: unknown[];
  board: unknown[];
  pot: number;
  winner?: string | null;
  actions: unknown[];
  bettingSequence: unknown[];
  analysisStatus: HandAnalysisStatus;
  analysisData?: unknown;
  handHistoryRaw?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Statistics {
  id: string;
  sessionId?: string | null;
  handId?: string | null;
  tableId?: string | null;
  type: string;
  data: Record<string, unknown>;
  periodStart?: string | null;
  periodEnd?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Upload {
  id: string;
  sessionId?: string | null;
  handId?: string | null;
  bucket: string;
  path: string;
  filename: string;
  mimeType?: string | null;
  sizeBytes: number;
  type: UploadType;
  status: UploadStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  sessionId?: string | null;
  handId?: string | null;
  content: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppSetting {
  id: string;
  key: string;
  value: Record<string, unknown>;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---------- Realtime ----------

export type RealtimeEvent<T = unknown> =
  | { type: 'INSERT'; table: string; record: T }
  | { type: 'UPDATE'; table: string; record: T }
  | { type: 'DELETE'; table: string; id: string };

// ---------- API ----------

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
