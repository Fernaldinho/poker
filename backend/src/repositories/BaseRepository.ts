import { prisma } from '../database/prisma';

/**
 * Repository base genérico.
 * Encapsula acesso ao Prisma para as entidades.
 * Nota: os args são tipados pelo Prisma em runtime; aqui usa-se any
 * para manter o pattern genérico entre entidades.
 */
export abstract class BaseRepository<T> {
  protected abstract model: {
    findMany(args?: any): Promise<T[]>;
    findUnique(args: any): Promise<T | null>;
    findFirst(args: any): Promise<T | null>;
    create(args: any): Promise<T>;
    update(args: any): Promise<T>;
    delete(args: any): Promise<T>;
    count(args?: any): Promise<number>;
  };

  async findById(id: string): Promise<T | null> {
    return this.model.findUnique({ where: { id } });
  }

  async findAll(args?: any): Promise<T[]> {
    return this.model.findMany(args ?? {});
  }

  async create(data: any): Promise<T> {
    return this.model.create({ data });
  }

  async update(id: string, data: any): Promise<T> {
    return this.model.update({ where: { id }, data });
  }

  async delete(id: string): Promise<T> {
    return this.model.delete({ where: { id } });
  }

  async count(args?: any): Promise<number> {
    return this.model.count(args);
  }
}

export { prisma };
