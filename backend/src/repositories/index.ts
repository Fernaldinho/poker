import { PokerTable, Upload, Note, Statistics, Tag, AppSetting } from '@prisma/client';
import { prisma } from '../database/prisma';
import { BaseRepository } from './BaseRepository';

export class TableRepository extends BaseRepository<PokerTable> {
  protected model = {
    findMany: (args: any) => prisma.pokerTable.findMany(args),
    findUnique: (args: any) => prisma.pokerTable.findUnique(args),
    findFirst: (args: any) => prisma.pokerTable.findFirst(args),
    create: (args: any) => prisma.pokerTable.create(args),
    update: (args: any) => prisma.pokerTable.update(args),
    delete: (args: any) => prisma.pokerTable.delete(args),
    count: (args?: any) => prisma.pokerTable.count(args),
  };
}

export class UploadRepository extends BaseRepository<Upload> {
  protected model = {
    findMany: (args: any) => prisma.upload.findMany(args),
    findUnique: (args: any) => prisma.upload.findUnique(args),
    findFirst: (args: any) => prisma.upload.findFirst(args),
    create: (args: any) => prisma.upload.create(args),
    update: (args: any) => prisma.upload.update(args),
    delete: (args: any) => prisma.upload.delete(args),
    count: (args?: any) => prisma.upload.count(args),
  };
}

export class NoteRepository extends BaseRepository<Note> {
  protected model = {
    findMany: (args: any) => prisma.note.findMany(args),
    findUnique: (args: any) => prisma.note.findUnique(args),
    findFirst: (args: any) => prisma.note.findFirst(args),
    create: (args: any) => prisma.note.create(args),
    update: (args: any) => prisma.note.update(args),
    delete: (args: any) => prisma.note.delete(args),
    count: (args?: any) => prisma.note.count(args),
  };
}

export class StatisticsRepository extends BaseRepository<Statistics> {
  protected model = {
    findMany: (args: any) => prisma.statistics.findMany(args),
    findUnique: (args: any) => prisma.statistics.findUnique(args),
    findFirst: (args: any) => prisma.statistics.findFirst(args),
    create: (args: any) => prisma.statistics.create(args),
    update: (args: any) => prisma.statistics.update(args),
    delete: (args: any) => prisma.statistics.delete(args),
    count: (args?: any) => prisma.statistics.count(args),
  };
}

export class TagRepository extends BaseRepository<Tag> {
  protected model = {
    findMany: (args: any) => prisma.tag.findMany(args),
    findUnique: (args: any) => prisma.tag.findUnique(args),
    findFirst: (args: any) => prisma.tag.findFirst(args),
    create: (args: any) => prisma.tag.create(args),
    update: (args: any) => prisma.tag.update(args),
    delete: (args: any) => prisma.tag.delete(args),
    count: (args?: any) => prisma.tag.count(args),
  };
}

export class SettingsRepository extends BaseRepository<AppSetting> {
  protected model = {
    findMany: (args: any) => prisma.appSetting.findMany(args),
    findUnique: (args: any) => prisma.appSetting.findUnique(args),
    findFirst: (args: any) => prisma.appSetting.findFirst(args),
    create: (args: any) => prisma.appSetting.create(args),
    update: (args: any) => prisma.appSetting.update(args),
    delete: (args: any) => prisma.appSetting.delete(args),
    count: (args?: any) => prisma.appSetting.count(args),
  };

  async getValue(key: string): Promise<unknown> {
    const setting = await prisma.appSetting.findUnique({ where: { key } });
    return setting?.value;
  }

  async setValue(key: string, value: unknown): Promise<AppSetting> {
    return prisma.appSetting.upsert({
      where: { key },
      update: { value: value as never },
      create: { key, value: value as never },
    });
  }
}
