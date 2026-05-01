import { Logger } from 'winston';

interface CanonicalFields {
  event: string;
  status: 'success' | 'error';
  durationMs: number;
  errorCode?: string;
  errorMessage?: string;
  [key: string]: unknown;
}

export const logCanonical = (log: Logger, fields: CanonicalFields): void => {
  const level = fields.status === 'error' ? 'error' : 'info';
  log[level](fields.event, fields);
};
