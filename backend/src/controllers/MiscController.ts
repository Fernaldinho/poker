import { Request, Response } from 'express';
import { SettingsService, TableService, TagService, NoteService } from '../services';

/**
 * Controllers de apoio: configurações, mesas, tags e notas.
 * Métodos em arrow function para preservar o `this`.
 */
export class MiscController {
  private settings = new SettingsService();
  private tables = new TableService();
  private tags = new TagService();
  private notes = new NoteService();

  // --- Settings ---
  getSettings = async (_req: Request, res: Response): Promise<void> => {
    res.json({ success: true, data: await this.settings.getAll() });
  };

  getSetting = async (req: Request, res: Response): Promise<void> => {
    res.json({ success: true, data: await this.settings.get(req.params.key) });
  };

  setSetting = async (req: Request, res: Response): Promise<void> => {
    res.json({ success: true, data: await this.settings.set(req.params.key, req.body.value) });
  };

  // --- Tables ---
  listTables = async (_req: Request, res: Response): Promise<void> => {
    res.json({ success: true, data: await this.tables.list() });
  };

  createTable = async (req: Request, res: Response): Promise<void> => {
    res.status(201).json({ success: true, data: await this.tables.create(req.body) });
  };

  updateTable = async (req: Request, res: Response): Promise<void> => {
    res.json({ success: true, data: await this.tables.update(req.params.id, req.body) });
  };

  deleteTable = async (req: Request, res: Response): Promise<void> => {
    res.json({ success: true, data: await this.tables.remove(req.params.id) });
  };

  // --- Tags ---
  listTags = async (_req: Request, res: Response): Promise<void> => {
    res.json({ success: true, data: await this.tags.list() });
  };

  createTag = async (req: Request, res: Response): Promise<void> => {
    res.status(201).json({ success: true, data: await this.tags.create(req.body) });
  };

  deleteTag = async (req: Request, res: Response): Promise<void> => {
    res.json({ success: true, data: await this.tags.remove(req.params.id) });
  };

  // --- Notes ---
  listNotesBySession = async (req: Request, res: Response): Promise<void> => {
    res.json({ success: true, data: await this.notes.listBySession(req.params.sessionId) });
  };

  createNote = async (req: Request, res: Response): Promise<void> => {
    res.status(201).json({ success: true, data: await this.notes.create(req.body) });
  };

  updateNote = async (req: Request, res: Response): Promise<void> => {
    res.json({ success: true, data: await this.notes.update(req.params.id, req.body) });
  };

  deleteNote = async (req: Request, res: Response): Promise<void> => {
    res.json({ success: true, data: await this.notes.remove(req.params.id) });
  };

  // --- Health ---
  health = async (_req: Request, res: Response): Promise<void> => {
    res.json({
      success: true,
      data: {
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
    });
  };
}
