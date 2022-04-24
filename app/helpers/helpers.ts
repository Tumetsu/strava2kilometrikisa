import { env } from '../environment';

/**
 * Are we in development environment?
 * @returns {boolean}
 */
export function isDev() {
  return env.env === 'development';
}
