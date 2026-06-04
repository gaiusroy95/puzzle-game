import type { LevelFile, LoadedLevel } from '@shared/levels';
import { levelValidator } from '@game/levels/validation/LevelValidator';

export interface ImportResult {
  success: boolean;
  level?: LoadedLevel;
  issues: Array<{ path: string; message: string }>;
}

/**
 * Parses pasted/uploaded JSON for editor pipeline and runtime hot-reload experiments.
 */
export class LevelImporter {
  static parseJson(raw: string): ImportResult {
    try {
      const data: unknown = JSON.parse(raw);
      const validation = levelValidator.validateLevelFile(data);
      if (!validation.valid) {
        return { success: false, issues: validation.issues };
      }
      const file = data as LevelFile;
      const definition = levelValidator.toLevelDefinition(file);
      return {
        success: true,
        level: { metadata: file.metadata, definition },
        issues: [],
      };
    } catch (error) {
      return {
        success: false,
        issues: [
          {
            path: '',
            message: error instanceof Error ? error.message : 'Invalid JSON',
          },
        ],
      };
    }
  }

  static async parseFile(file: File): Promise<ImportResult> {
    const text = await file.text();
    return this.parseJson(text);
  }
}
