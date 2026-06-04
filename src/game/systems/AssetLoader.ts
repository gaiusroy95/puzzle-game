import type Phaser from 'phaser';

export type AssetManifestEntry = {
  key: string;
  url: string;
  type: 'image' | 'audio' | 'json' | 'spritesheet';
  frameConfig?: Phaser.Types.Loader.FileTypes.ImageFrameConfig;
};

export type AssetPack = {
  id: string;
  assets: AssetManifestEntry[];
};

/**
 * Lazy, pack-based asset loading. Scenes register packs instead of hard-coding URLs.
 */
export class AssetLoader {
  constructor(private readonly scene: Phaser.Scene) {}

  queuePack(pack: AssetPack): void {
    for (const asset of pack.assets) {
      switch (asset.type) {
        case 'image':
          this.scene.load.image(asset.key, asset.url);
          break;
        case 'audio':
          this.scene.load.audio(asset.key, asset.url);
          break;
        case 'json':
          this.scene.load.json(asset.key, asset.url);
          break;
        case 'spritesheet':
          this.scene.load.spritesheet(asset.key, asset.url, asset.frameConfig);
          break;
        default: {
          const _exhaustive: never = asset.type;
          return _exhaustive;
        }
      }
    }
  }

  loadPack(pack: AssetPack): Promise<void> {
    return new Promise((resolve, reject) => {
      this.scene.load.once('complete', () => resolve());
      this.scene.load.once('loaderror', (_file: Phaser.Loader.File) => {
        reject(new Error(`Failed to load asset pack: ${pack.id}`));
      });
      this.queuePack(pack);
      this.scene.load.start();
    });
  }
}
