import type { ConnectionStatus, MultiplayerSession } from '@shared/multiplayer';

/**
 * Placeholder session holder for future WebSocket / room-based multiplayer.
 * Keeps multiplayer concerns out of Phaser scenes and React components.
 */
export class MultiplayerSessionService {
  private session: MultiplayerSession = {
    sessionId: '',
    roomId: null,
    playerId: null,
    status: 'disconnected',
  };

  getSnapshot(): Readonly<MultiplayerSession> {
    return this.session;
  }

  setStatus(status: ConnectionStatus): void {
    this.session = { ...this.session, status };
  }

  reset(): void {
    this.session = {
      sessionId: '',
      roomId: null,
      playerId: null,
      status: 'disconnected',
    };
  }
}

export const multiplayerSession = new MultiplayerSessionService();
