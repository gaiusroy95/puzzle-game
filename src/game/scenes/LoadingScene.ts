import Phaser from 'phaser';
import { BaseScene } from '@game/scenes/BaseScene';
import { levelCatalog } from '@game/levels/LevelCatalog';
import { AssetLoader } from '@game/systems/AssetLoader';
import { SceneKey } from '@shared/scenes';

const CORE_UI_PACK = {
  id: 'core-ui',
  assets: [] as import('@game/systems/AssetLoader').AssetManifestEntry[],
};

/**
 * Loads lazy asset packs before gameplay scenes. Extend CORE_UI_PACK as art is added.
 */
export class LoadingScene extends BaseScene {
  private assetLoader!: AssetLoader;
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;

  constructor() {
    super(SceneKey.Loading);
  }

  create(): void {
    super.create();
    this.emitPhase('loading');
    this.assetLoader = new AssetLoader(this);

    const { width, height } = this.cameras.main;
    this.progressBox = this.add.graphics();
    this.progressBar = this.add.graphics();

    const label = this.add.text(width / 2, height / 2 - 24, 'Loading…', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '18px',
      color: '#cccccc',
    });
    label.setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      this.progressBox.clear();
      this.progressBar.clear();
      const barWidth = 280;
      const barHeight = 12;
      const x = (width - barWidth) / 2;
      const y = height / 2 + 8;
      this.progressBox.fillStyle(0x222222, 0.85);
      this.progressBox.fillRect(x, y, barWidth, barHeight);
      this.progressBar.fillStyle(0x4ecca3, 1);
      this.progressBar.fillRect(x, y, barWidth * value, barHeight);
    });

    void this.runLoadingPipeline();
  }

  private async runLoadingPipeline(): Promise<void> {
    try {
      if (CORE_UI_PACK.assets.length > 0) {
        await this.assetLoader.loadPack(CORE_UI_PACK);
      }
      await levelCatalog.initialize();
      this.goTo(SceneKey.MainMenu);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Asset load failed';
      this.registry.set('lastLoadError', message);
      this.scene.restart();
    }
  }
}
