import { getDbConnection } from './services/database/database';
import { getApp } from './server';

async function init() {
  await getDbConnection();
  await getApp();
}

init();
