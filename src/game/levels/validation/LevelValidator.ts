import type { LevelDefinition, LevelEntity, LevelTile, PuzzleTypeId, TileType } from '@shared/puzzle';
import type { LevelFile, LevelMetadata, StarThresholds } from '@shared/levels';

export interface ValidationIssue {
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

const PUZZLE_TYPES: PuzzleTypeId[] = ['push-blocks', 'custom'];
const TILE_TYPES: TileType[] = ['floor', 'wall'];
const ENTITY_KINDS = ['player', 'box', 'goal', 'trigger', 'interactive', 'dynamic'] as const;

export class LevelValidator {
  validateManifest(data: unknown): ValidationResult {
    const issues: ValidationIssue[] = [];
    if (!data || typeof data !== 'object') {
      return { valid: false, issues: [{ path: '', message: 'Manifest must be an object' }] };
    }
    const m = data as Record<string, unknown>;
    if (typeof m.version !== 'number') issues.push({ path: 'version', message: 'Required number' });
    if (typeof m.campaignId !== 'string') issues.push({ path: 'campaignId', message: 'Required string' });
    if (!Array.isArray(m.levels)) {
      issues.push({ path: 'levels', message: 'Required array' });
    } else {
      m.levels.forEach((entry, i) => this.validateManifestEntry(entry, `levels[${i}]`, issues));
    }
    return { valid: issues.length === 0, issues };
  }

  validateLevelFile(data: unknown): ValidationResult {
    const issues: ValidationIssue[] = [];
    if (!data || typeof data !== 'object') {
      return { valid: false, issues: [{ path: '', message: 'Level file must be an object' }] };
    }
    const file = data as Record<string, unknown>;
    if (typeof file.version !== 'number') issues.push({ path: 'version', message: 'Required number' });
    this.validateMetadata(file.metadata, 'metadata', issues);
    if (!file.definition || typeof file.definition !== 'object') {
      issues.push({ path: 'definition', message: 'Required object' });
    } else {
      const meta = file.metadata as LevelMetadata | undefined;
      const id = meta?.id ?? 'unknown';
      const name = meta?.name ?? 'Unknown';
      const def = file.definition as Record<string, unknown>;
      this.validateDefinitionBody(
        { ...def, id, name, puzzleType: def.puzzleType as PuzzleTypeId } as LevelDefinition,
        'definition',
        issues,
      );
    }
    return { valid: issues.length === 0, issues };
  }

  validateDefinition(definition: LevelDefinition, pathPrefix = ''): ValidationResult {
    const issues: ValidationIssue[] = [];
    this.validateDefinitionBody(definition, pathPrefix, issues);
    return { valid: issues.length === 0, issues };
  }

  toLevelDefinition(file: LevelFile): LevelDefinition {
    const result = this.validateLevelFile(file);
    if (!result.valid) {
      throw new Error(`Invalid level file: ${result.issues.map((i) => i.message).join('; ')}`);
    }
    return {
      id: file.metadata.id,
      name: file.metadata.name,
      puzzleType: file.definition.puzzleType,
      grid: file.definition.grid,
      tiles: file.definition.tiles,
      entities: file.definition.entities,
      rules: file.definition.rules,
      winConditions: file.definition.winConditions,
      failConditions: file.definition.failConditions,
      limits: file.definition.limits,
    };
  }

  private validateManifestEntry(entry: unknown, path: string, issues: ValidationIssue[]): void {
    if (!entry || typeof entry !== 'object') {
      issues.push({ path, message: 'Must be an object' });
      return;
    }
    const e = entry as Record<string, unknown>;
    if (typeof e.id !== 'string') issues.push({ path: `${path}.id`, message: 'Required string' });
    if (typeof e.file !== 'string') issues.push({ path: `${path}.file`, message: 'Required string' });
    if (typeof e.order !== 'number') issues.push({ path: `${path}.order`, message: 'Required number' });
    if (typeof e.stage !== 'number') issues.push({ path: `${path}.stage`, message: 'Required number' });
  }

  private validateMetadata(meta: unknown, path: string, issues: ValidationIssue[]): void {
    if (!meta || typeof meta !== 'object') {
      issues.push({ path, message: 'Required object' });
      return;
    }
    const m = meta as Record<string, unknown>;
    const required = ['id', 'name', 'order', 'stage', 'difficulty', 'starThresholds'] as const;
    for (const key of required) {
      if (m[key] === undefined) issues.push({ path: `${path}.${key}`, message: 'Required' });
    }
    if (m.starThresholds) this.validateStarThresholds(m.starThresholds, `${path}.starThresholds`, issues);
  }

  private validateStarThresholds(data: unknown, path: string, issues: ValidationIssue[]): void {
    if (!data || typeof data !== 'object') {
      issues.push({ path, message: 'Must be an object' });
      return;
    }
    const t = data as StarThresholds;
    if (typeof t.threeStarMoves !== 'number') issues.push({ path: `${path}.threeStarMoves`, message: 'Required' });
    if (typeof t.twoStarMoves !== 'number') issues.push({ path: `${path}.twoStarMoves`, message: 'Required' });
    if (typeof t.oneStarMoves !== 'number') issues.push({ path: `${path}.oneStarMoves`, message: 'Required' });
    if (
      t.threeStarMoves > t.twoStarMoves ||
      t.twoStarMoves > t.oneStarMoves
    ) {
      issues.push({ path, message: 'Thresholds must satisfy three <= two <= one' });
    }
  }

  private validateDefinitionBody(def: LevelDefinition, path: string, issues: ValidationIssue[]): void {
    if (!def.id) issues.push({ path: `${path}.id`, message: 'Required' });
    if (!def.name) issues.push({ path: `${path}.name`, message: 'Required' });
    if (!PUZZLE_TYPES.includes(def.puzzleType)) {
      issues.push({ path: `${path}.puzzleType`, message: 'Invalid puzzle type' });
    }
    if (!def.grid || def.grid.width < 3 || def.grid.height < 3) {
      issues.push({ path: `${path}.grid`, message: 'Grid must be at least 3x3' });
    }
    if (!Array.isArray(def.entities) || def.entities.length === 0) {
      issues.push({ path: `${path}.entities`, message: 'At least one entity required' });
    }
    const players = def.entities?.filter((e) => e.kind === 'player') ?? [];
    if (players.length !== 1) {
      issues.push({ path: `${path}.entities`, message: 'Exactly one player required' });
    }
    def.entities?.forEach((entity, i) => this.validateEntity(entity, def, `${path}.entities[${i}]`, issues));
    def.tiles?.forEach((tile, i) => this.validateTile(tile, def, `${path}.tiles[${i}]`, issues));
    if (!def.winConditions?.length) {
      issues.push({ path: `${path}.winConditions`, message: 'At least one win condition required' });
    }
  }

  private validateEntity(entity: LevelEntity, def: LevelDefinition, path: string, issues: ValidationIssue[]): void {
    if (!ENTITY_KINDS.includes(entity.kind)) {
      issues.push({ path: `${path}.kind`, message: 'Invalid entity kind' });
    }
    if (!def.grid) return;
    if (entity.x < 0 || entity.y < 0 || entity.x >= def.grid.width || entity.y >= def.grid.height) {
      issues.push({ path, message: 'Entity out of grid bounds' });
    }
  }

  private validateTile(tile: LevelTile, def: LevelDefinition, path: string, issues: ValidationIssue[]): void {
    if (!TILE_TYPES.includes(tile.type)) {
      issues.push({ path: `${path}.type`, message: 'Invalid tile type' });
    }
    if (tile.x < 0 || tile.y < 0 || tile.x >= def.grid.width || tile.y >= def.grid.height) {
      issues.push({ path, message: 'Tile out of grid bounds' });
    }
  }
}

export const levelValidator = new LevelValidator();
