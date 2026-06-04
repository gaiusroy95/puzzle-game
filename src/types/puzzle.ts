/** Shared puzzle contracts — logic layer and level authoring. */

export type PuzzleTypeId = 'push-blocks' | 'custom';

export type Direction = 'up' | 'down' | 'left' | 'right';

export type TileType = 'floor' | 'wall';

export type EntityKind =
  | 'player'
  | 'box'
  | 'goal'
  | 'trigger'
  | 'interactive'
  | 'dynamic';

export type WinConditionType =
  | 'all_boxes_on_goals'
  | 'entity_on_tile'
  | 'all_triggers_active';

export type FailConditionType = 'max_moves_exceeded' | 'player_on_hazard';

export type PuzzlePlayState = 'idle' | 'playing' | 'won' | 'lost' | 'paused';

export type InputDevice = 'keyboard' | 'mouse' | 'gamepad';

export type InputActionType =
  | 'move'
  | 'interact'
  | 'restart'
  | 'undo'
  | 'pause';

export interface GridPosition {
  x: number;
  y: number;
}

export interface GridConfig {
  width: number;
  height: number;
  cellSize: number;
}

export interface LevelTile {
  x: number;
  y: number;
  type: TileType;
}

export interface LevelEntity {
  id: string;
  kind: EntityKind;
  x: number;
  y: number;
  /** Optional link between box and goal (same value = matched pair). */
  groupId?: string;
  /** Trigger fires when any movable enters this cell. */
  triggerId?: string;
}

export interface WinConditionDefinition {
  type: WinConditionType;
  params?: Record<string, unknown>;
}

export interface FailConditionDefinition {
  type: FailConditionType;
  params?: Record<string, unknown>;
}

export interface LevelRules {
  puzzleType: PuzzleTypeId;
  allowPush?: boolean;
  allowPull?: boolean;
}

export interface LevelLimits {
  maxMoves?: number;
}

export interface LevelDefinition {
  id: string;
  name: string;
  puzzleType: PuzzleTypeId;
  grid: GridConfig;
  tiles: LevelTile[];
  entities: LevelEntity[];
  rules: LevelRules;
  winConditions: WinConditionDefinition[];
  failConditions?: FailConditionDefinition[];
  limits?: LevelLimits;
}

export interface InputAction {
  type: InputActionType;
  device: InputDevice;
  direction?: Direction;
  gridPosition?: GridPosition;
  timestamp: number;
}

export interface PuzzleEntityState {
  id: string;
  kind: EntityKind;
  x: number;
  y: number;
  groupId?: string;
  triggerId?: string;
  isActive?: boolean;
}

export interface PuzzleWorldSnapshot {
  levelId: string;
  grid: GridConfig;
  tiles: LevelTile[];
  entities: PuzzleEntityState[];
  triggeredIds: string[];
  moveCount: number;
}

export interface PuzzleOutcome {
  state: PuzzlePlayState;
  reason?: string;
}
