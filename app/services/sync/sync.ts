import * as kilometrikisa from 'kilometrikisa-client';
import { getStravaActivities, KilometrikisaActivityByDate } from '../strava/strava';
import { syncLogger } from '../../helpers/logger';
import { env } from '../../environment';

/**
 * Sync items from Strava to Kilometrikisa.
 *
 * @param  stravaUserId           Strava user id.
 * @param  stravaToken            Strava token.
 * @param  stravaToken            Kilometrikisa token.
 * @param  kilometrikisaToken     Kilometrikisa token.
 * @param  kilometrikisaSessionId Kilometrikisa session id.
 * @param syncEBike
 */
export async function doSync(
  stravaUserId: number,
  stravaToken: string,
  kilometrikisaToken: string,
  kilometrikisaSessionId: string,
  syncEBike: boolean,
) {
  const activities = await getStravaActivities(stravaToken, syncEBike);
  const session = await kilometrikisa.kilometrikisaSession({
    token: kilometrikisaToken,
    sessionId: kilometrikisaSessionId,
  });

  const contestId = parseInt(env.contestId);
  const failedActivities: KilometrikisaActivityByDate = {};
  const syncedActivities: KilometrikisaActivityByDate = {};
  await Promise.all(
    Object.entries(activities).map(async ([date, activity]) => {
      try {
        await session.updateContestLog(contestId, date, activity.distance, activity.isEBike);
        await session.updateMinuteContestLog(
          contestId,
          date,
          activity.hours,
          activity.minutes,
          activity.isEBike,
        );
        syncedActivities[date] = activity;
      } catch (err) {
        syncLogger.warn('Could not post activity to Kilometrikisa', activity);
        failedActivities[date] = activity;
      }
    }),
  );

  if (Object.entries(failedActivities).length > 0) {
    throw new Error('Failed to sync following activities: ' + JSON.stringify(failedActivities));
  }

  return syncedActivities;
}
