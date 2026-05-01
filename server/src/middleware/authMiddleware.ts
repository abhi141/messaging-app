import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthError } from '../errors/AppError';
import { JwtPayload } from '../dtos/auth.dto';

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AuthError('Session required. Please log in.', 'AUTH_MISSING_TOKEN'));
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(new AuthError('Session expired. Please log in again.', 'AUTH_TOKEN_EXPIRED'));
    }
    return next(new AuthError('Invalid session. Please log in again.', 'AUTH_INVALID_TOKEN'));
  }
}

/**
 * TSOA authentication handler — called by generated routes for @Security('bearerAuth').
 * Returns the decoded JWT payload which TSOA stores as req.user.
 */
export async function expressAuthentication(
  req: Request,
  securityName: string,
  _scopes?: string[],
): Promise<JwtPayload> {
  if (securityName === 'bearerAuth') {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AuthError('Session required. Please log in.', 'AUTH_MISSING_TOKEN');
    }
    const token = authHeader.slice(7);
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      req.user = payload;
      return payload;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new AuthError('Session expired. Please log in again.', 'AUTH_TOKEN_EXPIRED');
      }
      throw new AuthError('Invalid session. Please log in again.', 'AUTH_INVALID_TOKEN');
    }
  }
  throw new AuthError('Unknown security scheme.', 'AUTH_ERROR');
}
