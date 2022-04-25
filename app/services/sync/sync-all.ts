import * as kilometrikisa from 'kilometrikisa-client';
import { doSync } from './sync';
import { User, UserModel } from '../../models/UserModel';
import logger from '../../helpers/logger';

/**
 * Sync all users from the database. Waits a bit after each user to not
 * overwhelm the target server.
 *
 * @param throttle
 */
export async function syncAllUsers(throttle = 3500) {
  logger.info('Syncing all users...');
  logger.info('Connected to DB.');

  // Find all users having autosync enabled.
  const users: User[] = await UserModel.find({
    autosync: true,
    kilometrikisaUsername: { $exists: true },
    kilometrikisaPassword: { $exists: true },
  });

  logger.info('Found ' + users.length + ' users to sync...');

  for (const user of users) {
    await syncUser(user);
    await timeout(throttle);
  }
}

/**
 * Sync given user.
 */
async function syncUser(user: User) {
  logger.info(`Syncing for user ${user.kilometrikisaUsername}`);

  try {
    const session = await kilometrikisa.kilometrikisaSession({
      username: user.kilometrikisaUsername,
      password: user.getPassword(),
    });

    logger.info('Login complete: ' + user.kilometrikisaUsername);

    // Save login token.
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
      logger.info(`${Object.keys(activities).length} activities synced`);
    } catch (err) {
      logger.warn(`Activities sync failed for user ${user.kilometrikisaUsername}`);
    }
  } catch (err) {
    logger.warn(`User ${user.kilometrikisaUsername} login failed.`);
  }
}

function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
