import { useSettingsStore } from '@store/settingsStore';

export type SfxId = 'move' | 'win' | 'lose' | 'ui' | 'error';

const SFX_FREQ: Record<SfxId, number> = {
  move: 440,
  win: 660,
  lose: 220,
  ui: 520,
  error: 180,
};

/**
 * Lightweight procedural SFX — no asset files required; swap for samples later.
 */
class AudioManager {
  private context: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (this.context) return this.context;
    try {
      this.context = new AudioContext();
      return this.context;
    } catch {
      return null;
    }
  }

  async play(id: SfxId): Promise<void> {
    const settings = useSettingsStore.getState();
    if (settings.audio.muted || settings.audio.masterVolume <= 0) return;

    const ctx = this.getContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') await ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const volume =
      settings.audio.masterVolume *
      settings.audio.sfxVolume *
      (id === 'win' ? 0.35 : 0.2);

    osc.type = id === 'win' ? 'triangle' : 'sine';
    osc.frequency.value = SFX_FREQ[id];
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + (id === 'move' ? 0.05 : 0.15));
  }
}

export const audioManager = new AudioManager();
