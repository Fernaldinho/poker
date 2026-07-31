import { Router } from 'express';
import multer from 'multer';
import { SessionController } from '../controllers/SessionController';
import { HandController } from '../controllers/HandController';
import { StorageController } from '../controllers/StorageController';
import { MiscController } from '../controllers/MiscController';
import { config } from '../config';

const sessionController = new SessionController();
const handController = new HandController();
const storageController = new StorageController();
const miscController = new MiscController();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.storage.maxUploadSizeMb * 1024 * 1024 },
});

export const router = Router();

// --- Health ---
router.get('/health', miscController.health);

// --- Sessions ---
router.get('/sessions', sessionController.list);
router.post('/sessions', sessionController.create);
router.get('/sessions/:id', sessionController.getById);
router.patch('/sessions/:id', sessionController.update);
router.delete('/sessions/:id', sessionController.remove);
router.post('/sessions/:id/live/start', sessionController.startLive);
router.post('/sessions/:id/live/stop', sessionController.stopLive);
router.get('/sessions/:id/hands', sessionController.listHands);
router.post('/sessions/:id/hands', sessionController.createHand);
router.get('/sessions/:id/uploads', sessionController.listUploads);

// --- Hands ---
router.get('/hands/:id', handController.getById);
router.patch('/hands/:id', handController.update);
router.delete('/hands/:id', handController.remove);

// --- Storage ---
router.get('/storage/buckets', storageController.buckets);
router.post('/storage/upload', upload.single('file'), storageController.upload);
router.post('/storage/signed-url', storageController.signedUrl);
router.delete('/storage', storageController.delete);

// --- Settings ---
router.get('/settings', miscController.getSettings);
router.get('/settings/:key', miscController.getSetting);
router.put('/settings/:key', miscController.setSetting);

// --- Tables ---
router.get('/tables', miscController.listTables);
router.post('/tables', miscController.createTable);
router.patch('/tables/:id', miscController.updateTable);
router.delete('/tables/:id', miscController.deleteTable);

// --- Tags ---
router.get('/tags', miscController.listTags);
router.post('/tags', miscController.createTag);
router.delete('/tags/:id', miscController.deleteTag);

// --- Notes ---
router.get('/sessions/:sessionId/notes', miscController.listNotesBySession);
router.post('/notes', miscController.createNote);
router.patch('/notes/:id', miscController.updateNote);
router.delete('/notes/:id', miscController.deleteNote);
