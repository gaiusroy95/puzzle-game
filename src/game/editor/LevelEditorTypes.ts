/**
 * Editor-facing types — aligned with LevelFile schema for future visual editor tooling.
 */
export type { LevelFile, LevelMetadata, LevelManifest, StarThresholds } from '@shared/levels';
export type { LevelDefinition, LevelEntity, LevelTile } from '@shared/puzzle';

export interface EditorDocument {
  version: number;
  metadata: import('@shared/levels').LevelMetadata;
  definition: import('@shared/puzzle').LevelDefinition;
  modifiedAt: string;
}

export interface EditorExportOptions {
  pretty?: boolean;
  includeVersion?: boolean;
}
