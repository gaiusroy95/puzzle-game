import type { Request, Response, NextFunction } from 'express';
import type { ApiErrorBody } from '../../shared/types/api.js';

export class HttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly details?: ApiErrorBody['details'],
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof HttpError) {
    const body: ApiErrorBody = {
      error: err.message,
      code: err.code,
      details: err.details,
    };
    res.status(err.status).json(body);
    return;
  }

  console.error('[server]', err);
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
  } satisfies ApiErrorBody);
};

export const asyncHandler =
  <T extends Request, U extends Response>(
    fn: (req: T, res: U, next: NextFunction) => Promise<void>,
  ) =>
  (req: T, res: U, next: NextFunction): void => {
    void fn(req, res, next).catch(next);
  };
