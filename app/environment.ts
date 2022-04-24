import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();

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

/**
 * Load secrets from Google Secret Manager. Required for running the app on GCP app engine.
 */
export async function loadSecrets() {
  secrets.kilometrikisaSessionSecret = await getSecret(
    'projects/287232536/secrets/kilometrikisa_session_secret/versions/1',
  );
  secrets.kilometrikisaCryptoPassword = await getSecret(
    'projects/287232536/secrets/kilometrikisa_crypto_password/versions/1',
  );
  secrets.dbPassword = await getSecret('projects/287232536/secrets/mongodb_password/versions/1');
  secrets.stravaAccessToken = await getSecret(
    'projects/287232536/secrets/strava_access_token/versions/1',
  );
  secrets.stravaClientId = await getSecret(
    'projects/287232536/secrets/strava_client_id/versions/1',
  );
  secrets.stravaClientSecret = await getSecret(
    'projects/287232536/secrets/strava_client_secret/versions/1',
  );

  console.log('Secrets loaded from Secret Manager');
}

async function getSecret(name: string) {
  const result = await client.accessSecretVersion({
    name,
  });
  return result[0]?.payload?.data?.toString() || '';
}
