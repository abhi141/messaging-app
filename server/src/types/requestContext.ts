import { JwtPayload } from '../dtos/auth.dto';
import { Logger } from 'winston';

/**
 * Typed request context injected by middleware into every request.
 * Used in TSOA controllers via @Request() — avoids 'any' while staying
 * compatible with TSOA's type resolver (no express import here).
 */
export interface RequestContext {
  user: JwtPayload;
  log: Logger;
  correlationId: string;
}
