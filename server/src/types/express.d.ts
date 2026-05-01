import { JwtPayload } from '../dtos/auth.dto';
import { Logger } from 'winston';

/**
 * Globally augment Express.Request so middleware-injected fields are
 * type-safe everywhere, including authMiddleware and loggerMiddleware.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user: JwtPayload;
      log: Logger;
      correlationId: string;
    }
  }
}

export {};
