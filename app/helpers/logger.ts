import { env } from '../environment';
import { createLogger, format, transports } from 'winston';

export default createLogger({
  level: env.loggingLevel || 'info',
  format: format.combine(format.colorize(), format.simple()),
  transports: [new transports.Console()],
});

export const syncLogger = createLogger({
  level: env.loggingLevel || 'info',
  format: format.combine(
    format.label({ label: 'sync', message: true }),
    format.colorize(),
    format.simple(),
  ),
  transports: [new transports.Console()],
});
