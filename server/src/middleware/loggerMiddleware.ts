import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '../utils/createLogger';
import { logCanonical } from '../utils/canonicalLog';

export function loggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const correlationId =
    (req.headers['x-correlation-id'] as string | undefined) ?? `cid_${uuidv4()}`;
  res.setHeader('x-correlation-id', correlationId);

  req.correlationId = correlationId;
  req.log = createLogger({ module: 'http', correlationId });

  const start = Date.now();
  res.on('finish', () => {
    logCanonical(req.log, {
      event: 'http.request',
      status: res.statusCode < 500 ? 'success' : 'error',
      durationMs: Date.now() - start,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      userId: req.user?.userId,
    });
  });

  next();
}
