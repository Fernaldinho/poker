import { Router, NextFunction, Request, RequestHandler, Response } from 'express';
import multer from 'multer';
import { SessionController } from '../controllers/SessionController';
import { HandController } from '../controllers/HandController';
import { StorageController } from '../controllers/StorageController';
import { MiscController } from '../controllers/MiscController';
import { SessionTableController } from '../controllers/SessionTableController';
import { AIController } from '../controllers/AIController';
import { config } from '../config';

const sessionController = new SessionController();
const handController = new HandController();
const storageController = new StorageController();
const miscController = new MiscController();
const sessionTableController = new SessionTableController();
const aiController = new AIController();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.storage.maxUploadSizeMb * 1024 * 1024 },
});

/**
 * Envolve handlers async para que rejeições sejam
 * encaminhadas ao errorHandler (senão o Node derruba o processo).
 */
function wrap(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

export const router = Router();

// --- Health ---
router.get('/health', wrap(miscController.health));

// --- Sessions ---
router.get('/sessions', wrap(sessionController.list));
router.post('/sessions', wrap(sessionController.create));
router.get('/sessions/:id', wrap(sessionController.getById));
router.patch('/sessions/:id', wrap(sessionController.update));
router.delete('/sessions/:id', wrap(sessionController.remove));
router.post('/sessions/:id/live/start', wrap(sessionController.startLive));
router.post('/sessions/:id/live/stop', wrap(sessionController.stopLive));
router.get('/sessions/:id/hands', wrap(sessionController.listHands));
router.post('/sessions/:id/hands', wrap(sessionController.createHand));
router.get('/sessions/:id/uploads', wrap(sessionController.listUploads));

// --- Hands ---
router.get('/hands/:id', wrap(handController.getById));
router.patch('/hands/:id', wrap(handController.update));
router.delete('/hands/:id', wrap(handController.remove));

// --- Storage ---
router.get('/storage/buckets', wrap(storageController.buckets));
router.post('/storage/upload', upload.single('file'), wrap(storageController.upload));
router.post('/storage/register', wrap(storageController.register));
router.post('/storage/signed-url', wrap(storageController.signedUrl));
router.delete('/storage', wrap(storageController.delete));

// --- Session Tables (multi-mesa) ---
router.get('/sessions/:sessionId/tables', wrap(sessionTableController.list));
router.post('/sessions/:sessionId/tables', wrap(sessionTableController.create));
router.patch('/session-tables/:id', wrap(sessionTableController.rename));
router.delete('/session-tables/:id', wrap(sessionTableController.remove));

// --- AI (análise de frames de mesa) ---
router.post('/ai/analyze', wrap(aiController.analyze));
router.get('/ai/status', wrap(aiController.status));

// --- Settings ---
router.get('/settings', wrap(miscController.getSettings));
router.get('/settings/:key', wrap(miscController.getSetting));
router.put('/settings/:key', wrap(miscController.setSetting));

// --- Tables ---
router.get('/tables', wrap(miscController.listTables));
router.post('/tables', wrap(miscController.createTable));
router.patch('/tables/:id', wrap(miscController.updateTable));
router.delete('/tables/:id', wrap(miscController.deleteTable));

// --- Tags ---
router.get('/tags', wrap(miscController.listTags));
router.post('/tags', wrap(miscController.createTag));
router.delete('/tags/:id', wrap(miscController.deleteTag));

// --- Notes ---
router.get('/sessions/:sessionId/notes', wrap(miscController.listNotesBySession));
router.post('/notes', wrap(miscController.createNote));
router.patch('/notes/:id', wrap(miscController.updateNote));
router.delete('/notes/:id', wrap(miscController.deleteNote));
