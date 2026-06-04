import fs from 'node:fs/promises';
import path from 'node:path';

export class FileStorage {
  constructor(private readonly baseDir: string) {}

  async ensureDir(): Promise<void> {
    await fs.mkdir(this.baseDir, { recursive: true });
  }

  private resolve(filePath: string): string {
    const resolved = path.resolve(this.baseDir, filePath);
    if (!resolved.startsWith(path.resolve(this.baseDir))) {
      throw new Error('Invalid path');
    }
    return resolved;
  }

  async readJson<T>(filePath: string): Promise<T | null> {
    try {
      const raw = await fs.readFile(this.resolve(filePath), 'utf-8');
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async writeJson<T>(filePath: string, data: T): Promise<void> {
    const full = this.resolve(filePath);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, JSON.stringify(data, null, 2), 'utf-8');
  }
}
