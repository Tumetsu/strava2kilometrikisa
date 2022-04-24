import { env } from '../environment';

const { transports, format, createLogger } = require('winston');

export default createLogger({
  level: env.loggingLevel || 'info',
  format: format.combine(format.colorize(), format.simple()),
  transports: [new transports.Console()],
});
