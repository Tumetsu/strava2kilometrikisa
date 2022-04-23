/**
 * Are we in development environment?
 * @returns {boolean}
 */
export function isDev() {
  return process.env.STRAVA2KILOMETRIKISA_ENV === 'development';
}
