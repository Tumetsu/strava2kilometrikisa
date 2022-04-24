import { CronJob } from 'cron';
import logger from '../helpers/logger';
import { syncAllUsers } from '../services/sync/sync-all';

const time = process.env.CRON_TIME_SYNC || '0 4 * * *';

logger.info(`Worker running [${time}]...`);

new CronJob(
  time,
  function () {
    syncAllUsers();
  },
  null,
  true,
  'Europe/Helsinki',
);
