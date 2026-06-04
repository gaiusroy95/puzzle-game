import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService.js';
import { HttpError } from './errorHandler.js';

const authService = new AuthService();

export interface AuthenticatedRequest extends Request {
  auth?: { playerId: string; type: 'guest' | 'user' };
}

export const optionalAuth = (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    const payload = authService.verifyToken(header.slice(7));
    if (payload) req.auth = { playerId: payload.playerId, type: payload.type };
  }
  next();
};

export const requireAuth = (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
  optionalAuth(req, _res, () => {
    if (!req.auth) {
      next(new HttpError('Unauthorized', 401, 'UNAUTHORIZED'));
      return;
    }
    next();
  });
};
