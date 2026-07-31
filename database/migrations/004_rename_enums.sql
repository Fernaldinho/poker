-- Fix: renomear enums para os nomes esperados pelo Prisma
alter type "game_type" rename to "GameType";
alter type "session_status" rename to "SessionStatus";
alter type "upload_type" rename to "UploadType";
alter type "upload_status" rename to "UploadStatus";
alter type "hand_analysis_status" rename to "HandAnalysisStatus";
