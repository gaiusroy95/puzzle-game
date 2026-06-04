import Phaser from 'phaser';
import type { GridConfig, LevelTile, PuzzleEntityState, PuzzleWorldSnapshot } from '@shared/puzzle';
import { computeBoardLayout, type BoardLayout } from './BasePuzzleEntity';
import { DynamicPuzzleEntity } from './DynamicPuzzleEntity';
import { GoalObject } from './GoalObject';
import { GridBoardView } from './GridBoardView';
import { InteractiveObject } from './InteractiveObject';
import { PuzzleObject } from './PuzzleObject';
import { TriggerZone } from './TriggerZone';
import { isBoxOnAnyMatchingGoal, isBoxOnMatchingGoal } from '@game/puzzle/utils/boxGoalMatch';
import type { BasePuzzleEntity } from './BasePuzzleEntity';

/**
 * Presentation host — maps logic snapshots to Phaser views without gameplay rules.
 */
export class PuzzleViewHost extends Phaser.GameObjects.Container {
  private readonly entityViews = new Map<string, BasePuzzleEntity>();
  private boardView: GridBoardView | null = null;
  readonly layout: BoardLayout;

  constructor(
    scene: Phaser.Scene,
    grid: GridConfig,
    tiles: LevelTile[],
  ) {
    super(scene, 0, 0);
    this.layout = computeBoardLayout(scene, grid);
    scene.add.existing(this);
    this.boardView = new GridBoardView(scene, this.layout, grid, tiles);
    this.add(this.boardView);
  }

  getLayout(): BoardLayout {
    return this.layout;
  }

  buildFromSnapshot(snapshot: PuzzleWorldSnapshot): void {
    const existingIds = new Set(this.entityViews.keys());
    const nextIds = new Set(snapshot.entities.map((e) => e.id));

    for (const id of existingIds) {
      if (!nextIds.has(id)) {
        this.entityViews.get(id)?.destroy();
        this.entityViews.delete(id);
      }
    }

    for (const entity of snapshot.entities) {
      let view = this.entityViews.get(entity.id);
      if (!view) {
        view = this.createEntityView(entity);
        this.entityViews.set(entity.id, view);
        this.add(view);
      }
      view.syncState(entity);
      this.updateGoalFilledState(entity, snapshot);
      if (entity.kind === 'box') {
        (view as PuzzleObject).setOnGoal(isBoxOnAnyMatchingGoal(entity, snapshot.entities));
      }
    }
  }

  destroyAll(): void {
    this.entityViews.forEach((view) => view.destroy());
    this.entityViews.clear();
    this.boardView?.destroy();
    this.boardView = null;
    this.destroy();
  }

  private createEntityView(entity: PuzzleEntityState): BasePuzzleEntity {
    switch (entity.kind) {
      case 'player':
        return new InteractiveObject(this.scene, this.layout, entity, 0x3498db);
      case 'box':
        return new PuzzleObject(this.scene, this.layout, entity);
      case 'goal':
        return new GoalObject(this.scene, this.layout, entity);
      case 'trigger':
        return new TriggerZone(this.scene, this.layout, entity);
      case 'dynamic':
        return new DynamicPuzzleEntity(this.scene, this.layout, entity);
      case 'interactive':
        return new InteractiveObject(this.scene, this.layout, entity, 0x9b59b6);
      default: {
        const _exhaustive: never = entity.kind;
        return _exhaustive;
      }
    }
  }

  private updateGoalFilledState(entity: PuzzleEntityState, snapshot: PuzzleWorldSnapshot): void {
    if (entity.kind !== 'goal') return;
    const boxOnGoal = snapshot.entities.some(
      (e) => e.kind === 'box' && isBoxOnMatchingGoal(e, entity),
    );
    entity.isActive = boxOnGoal;
    this.entityViews.get(entity.id)?.syncState(entity);
  }
}
