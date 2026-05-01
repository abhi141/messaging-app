import { rootLogger } from '../config/logger';

export const createLogger = (context: Record<string, unknown>): typeof rootLogger =>
  rootLogger.child(context);
