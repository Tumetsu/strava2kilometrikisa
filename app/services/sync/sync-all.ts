import * as kilometrikisa from 'kilometrikisa-client';
import { doSync } from './sync';
import { User, UserModel } from '../../models/UserModel';
import { syncLogger } from '../../helpers/logger';

/**
 * Sync all users from the database. Waits a bit after each user to not
 * overwhelm the target server.
 *
 * @param throttle
 */
export async function syncAllUsers(throttle = 3500) {
  syncLogger.info('Syncing all users...');
  syncLogger.info('Connected to DB.');

  // Find all users having autosync enabled.
  const users: User[] = await UserModel.find({
    autosync: true,
    kilometrikisaUsername: { $exists: true },
    kilometrikisaPassword: { $exists: true },
  });

  syncLogger.info('Found ' + users.length + ' users to sync...');

  for (const user of users) {
    await syncUser(user);
    await timeout(throttle);
  }
}

/**
 * Sync given user.
 */
async function syncUser(user: User) {
  syncLogger.info(`Syncing for user ${user.kilometrikisaUsername}`);

  try {
    const session = await kilometrikisa.kilometrikisaSession({
      username: user.kilometrikisaUsername,
      password: user.getPassword(),
    });

    syncLogger.info('Login complete: ' + user.kilometrikisaUsername);

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
      syncLogger.info(`${Object.keys(activities).length} activities synced`);
    } catch (err) {
      syncLogger.warn(`Activities sync failed for user ${user.kilometrikisaUsername}`);
    }
  } catch (err) {
    syncLogger.warn(`User ${user.kilometrikisaUsername} login failed.`);
  }
}

function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
