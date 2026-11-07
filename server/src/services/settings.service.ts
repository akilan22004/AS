import { prisma } from '../config/database';

export class SettingsService {
  async get(key: string): Promise<string | null> {
    const setting = await prisma.websiteSetting.findUnique({ where: { key } });
    return setting?.value ?? null;
  }

  async getAll(): Promise<Record<string, string>> {
    const settings = await prisma.websiteSetting.findMany();
    return settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);
  }

  async set(key: string, value: string): Promise<void> {
    await prisma.websiteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  async setMany(settings: Record<string, string>): Promise<void> {
    await Promise.all(Object.entries(settings).map(([key, value]) => this.set(key, value)));
  }
}

export const settingsService = new SettingsService();
