/** Reserved types for future real-time multiplayer integration. */

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

export interface MultiplayerSession {
  sessionId: string;
  roomId: string | null;
  playerId: string | null;
  status: ConnectionStatus;
}

export interface MultiplayerMessage<T = unknown> {
  type: string;
  payload: T;
  timestamp: number;
}
