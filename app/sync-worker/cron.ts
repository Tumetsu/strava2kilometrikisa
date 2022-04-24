import * as kilometrikisa from 'kilometrikisa-client';
import { doSync } from '../services/sync/sync';
import { User, UserModel } from '../models/UserModel';
import logger from '../helpers/logger';
import { getDbConnection, disconnectDb } from '../services/database/database';

function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function syncAllUsers(throttle = 3500) {
  logger.info('Cronjob running...');
  await getDbConnection();
  logger.info('Connected to DB.');

  // Find all users having autosync enabled.
  const users: User[] = await UserModel.find({
    autosync: true,
    kilometrikisaUsername: { $exists: true },
    kilometrikisaPassword: { $exists: true },
  });

  // Start syncing.
  logger.info('Found ' + users.length + ' users to sync...');
  await syncNextUser(users, throttle);
}

/**
 * Get next user from the list and sync it. If users aren't left, we are done!
 */
async function syncNextUser(users: User[], throttle: number) {
  // All done!
  if (users.length == 0) {
    disconnectDb();
    logger.info(users.length + ' users left in queue.');
    logger.info('Disconnected from DB.');
    return;
  }

  logger.info(users.length + ' users left in queue.');

  const user = users.pop();
  if (user) {
    await syncUser(user);
    await timeout(throttle);
    await syncNextUser(users, throttle);
  }
}

/**
 * Sync given user.
 */
async function syncUser(user: User) {
  logger.info('!! Syncing for user ' + user.kilometrikisaUsername);

  try {
    const session = await kilometrikisa.kilometrikisaSession({
      username: user.kilometrikisaUsername,
      password: user.getPassword(),
    });

    logger.info('Login complete: ' + user.kilometrikisaUsername);

    // Save login token.
    // TODO: is this required or even used anywhere if we always log in with username/password above?
    user.set('kilometrikisaToken', session.sessionCredentials.token);
    user.set('kilometrikisaSessionId', session.sessionCredentials.sessionId);
    await user.updateToken();

    try {
      const activities = await doSync(
        user.stravaUserId,
        user.stravaToken,
        user.kilometrikisaToken,
        user.kilometrikisaSessionId,
        user.ebike,
      );
      logger.info(Object.keys(activities).length + ' activities synced');
    } catch (err) {
      logger.warn('Activities sync failed for user ' + user.kilometrikisaUsername, err);
    }
  } catch (err) {
    logger.warn('User ' + user.kilometrikisaUsername + ' login failed.');
  }
}
