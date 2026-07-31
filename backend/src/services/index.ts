import { SettingsRepository, TableRepository, TagRepository, NoteRepository } from '../repositories';
import { NotFoundError } from '../utils/AppError';

/** Serviço agregador para configurações, mesas, tags e notas. */
export class SettingsService {
  private settings = new SettingsRepository();

  async getAll() {
    return this.settings.findAll({ orderBy: { key: 'asc' } });
  }

  async get(key: string) {
    const value = await this.settings.getValue(key);
    if (value === undefined) throw new NotFoundError(`Configuração "${key}" não encontrada`);
    return { key, value };
  }

  async set(key: string, value: unknown) {
    return this.settings.setValue(key, value);
  }
}

export class TableService {
  private repository = new TableRepository();

  async list() {
    return this.repository.findAll({ orderBy: { name: 'asc' } });
  }

  async create(data: Record<string, unknown>) {
    return this.repository.create(data);
  }

  async getById(id: string) {
    const table = await this.repository.findById(id);
    if (!table) throw new NotFoundError('Mesa não encontrada');
    return table;
  }

  async update(id: string, data: Record<string, unknown>) {
    await this.getById(id);
    return this.repository.update(id, data);
  }

  async remove(id: string) {
    await this.getById(id);
    await this.repository.delete(id);
    return { success: true };
  }
}

export class TagService {
  private repository = new TagRepository();

  async list() {
    return this.repository.findAll({ orderBy: { name: 'asc' } });
  }

  async create(data: Record<string, unknown>) {
    return this.repository.create(data);
  }

  async remove(id: string) {
    await this.repository.delete(id);
    return { success: true };
  }
}

export class NoteService {
  private repository = new NoteRepository();

  async listBySession(sessionId: string) {
    return this.repository.findAll({ where: { sessionId }, orderBy: { createdAt: 'desc' } });
  }

  async create(data: Record<string, unknown>) {
    return this.repository.create(data);
  }

  async update(id: string, data: Record<string, unknown>) {
    await this.repository.findById(id);
    return this.repository.update(id, data);
  }

  async remove(id: string) {
    await this.repository.delete(id);
    return { success: true };
  }
}
