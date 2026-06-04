import crypto from 'node:crypto';
import { env } from '../config/env.js';

export interface AuthTokenPayload {
  playerId: string;
  type: 'guest' | 'user';
  exp: number;
}

/** Minimal token service — replace with JWT/OAuth when scaling auth. */
export class AuthService {
  createGuestToken(playerId: string): { token: string; expiresAt: string } {
    const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const payload: AuthTokenPayload = { playerId, type: 'guest', exp };
    const token = Buffer.from(
      JSON.stringify({ p: payload, sig: this.sign(JSON.stringify(payload)) }),
    ).toString('base64url');
    return { token, expiresAt: new Date(exp).toISOString() };
  }

  verifyToken(token: string): AuthTokenPayload | null {
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64url').toString('utf-8')) as {
        p: AuthTokenPayload;
        sig: string;
      };
      if (decoded.sig !== this.sign(JSON.stringify(decoded.p))) return null;
      if (decoded.p.exp < Date.now()) return null;
      return decoded.p;
    } catch {
      return null;
    }
  }

  private sign(data: string): string {
    return crypto.createHmac('sha256', env.authSecret).update(data).digest('hex');
  }
}
