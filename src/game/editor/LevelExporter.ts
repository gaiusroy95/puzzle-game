import type { LevelDefinition } from '@shared/puzzle';
import type { LevelFile, LevelMetadata } from '@shared/levels';
import type { EditorDocument, EditorExportOptions } from './LevelEditorTypes';

const LEVEL_FILE_VERSION = 1;

/**
 * Serializes levels for external files, CMS upload, or future visual editor save.
 */
export class LevelExporter {
  static toLevelFile(metadata: LevelMetadata, definition: LevelDefinition): LevelFile {
    const { id: _id, name: _name, puzzleType, ...rest } = definition;
    return {
      version: LEVEL_FILE_VERSION,
      metadata,
      definition: {
        puzzleType,
        grid: rest.grid,
        tiles: rest.tiles,
        entities: rest.entities,
        rules: rest.rules,
        winConditions: rest.winConditions,
        failConditions: rest.failConditions,
        limits: rest.limits,
      },
    };
  }

  static toDocument(metadata: LevelMetadata, definition: LevelDefinition): EditorDocument {
    return {
      version: LEVEL_FILE_VERSION,
      metadata,
      definition,
      modifiedAt: new Date().toISOString(),
    };
  }

  static toJson(
    metadata: LevelMetadata,
    definition: LevelDefinition,
    options: EditorExportOptions = {},
  ): string {
    const file = this.toLevelFile(metadata, definition);
    const payload = options.includeVersion === false ? file : file;
    return JSON.stringify(payload, null, options.pretty ? 2 : 0);
  }

  static downloadJson(
    metadata: LevelMetadata,
    definition: LevelDefinition,
    filename?: string,
  ): void {
    const json = this.toJson(metadata, definition, { pretty: true });
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename ?? `${metadata.id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  /** Utility for authoring border walls in editor tools. */
  static borderTiles(width: number, height: number): Array<{ x: number; y: number; type: 'wall' }> {
    const tiles: Array<{ x: number; y: number; type: 'wall' }> = [];
    for (let x = 0; x < width; x++) {
      tiles.push({ x, y: 0, type: 'wall' }, { x, y: height - 1, type: 'wall' });
    }
    for (let y = 1; y < height - 1; y++) {
      tiles.push({ x: 0, y, type: 'wall' }, { x: width - 1, y, type: 'wall' });
    }
    return tiles;
  }
}
