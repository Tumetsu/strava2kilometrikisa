import { CronJob } from 'cron';
import logger from '../helpers/logger';
import { syncAllUsers } from '../services/sync/sync-all';
import { env } from '../environment';

export function startWorker() {
  const time = env.cronTime || '0 4 * * *';

  logger.info(`Sync all worker running [${time}]...`);

  return new CronJob(
    time,
    function () {
      syncAllUsers();
    },
    null,
    true,
    'Europe/Helsinki',
  );
}
