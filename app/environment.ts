export const secrets = {
  kilometrikisaSessionSecret: process.env.KILOMETRIKISA_SESSION_SECRET ?? '',
  kilometrikisaCryptoPassword: process.env.KILOMETRIKISA_CRYPTO_PASSWORD ?? '',
  dbPassword: process.env.KILOMETRIKISA_DBPASSWORD,
  stravaAccessToken: process.env.STRAVA_ACCESS_TOKEN ?? '',
  stravaClientId: process.env.STRAVA_CLIENT_ID ?? '',
  stravaClientSecret: process.env.STRAVA_CLIENT_SECRET ?? '',
};

export const env = {
  env: process.env.STRAVA2KILOMETRIKISA_ENV || 'production',
  port: process.env.PORT || 3000,
  loggingLevel: process.env.LOGGING_LEVEL || 'info',
  dbUser: process.env.KILOMETRIKISA_DBUSER,
  dbHost: process.env.KILOMETRIKISA_DBHOST,
  dbName: process.env.KILOMETRIKISA_DB,
  contestId: process.env.KILOMETRIKISA_COMPETITION_ID ?? '0',
  cronTime: process.env.CRON_TIME_SYNC,
  stravaRedirectUri: process.env.STRAVA_REDIRECT_URI ?? '',
};
