import { doSync } from './sync';
import * as strava from '../strava/strava';

jest.mock('../strava/strava', () => {
  return {
    getStravaActivities: jest.fn(),
  };
});

jest.mock('kilometrikisa-client', () => {
  return {
    kilometrikisaSession: () => {
      return {
        updateContestLog: updateContestLogMock,
      };
    },
  };
});

let getStravaActivitiesMock: jest.Mock;
const updateContestLogMock = jest.fn();
describe('Sync', () => {
  beforeEach(() => {
    getStravaActivitiesMock = strava.getStravaActivities as unknown as jest.Mock;
  });

  it('should sync all activities and return object with succeeded activities listed', async () => {
    getStravaActivitiesMock.mockResolvedValue({
      '2022-05-03': {
        distance: 10,
        hours: 0,
        minutes: 20,
        isEBike: false,
      },
      '2022-05-04': {
        distance: 100,
        hours: 4,
        minutes: 20,
        isEBike: false,
      },
    });
    updateContestLogMock.mockResolvedValue({});
    const results = await doSync(123, 'token', 'kilometrikisatoken', 'sessionId', true);
    expect(Object.entries(results).length).toEqual(2);
  });

  it('should throw an error if one of the activities fails to sync', async () => {
    getStravaActivitiesMock.mockResolvedValue({
      '2022-05-03': {
        distance: 10,
        hours: 0,
        minutes: 20,
        isEBike: false,
      },
      // This will fail
      '2022-05-04': {
        distance: 100,
        hours: 4,
        minutes: 20,
        isEBike: false,
      },
      '2022-05-05': {
        distance: 80,
        hours: 3,
        minutes: 10,
        isEBike: false,
      },
    });

    updateContestLogMock
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new Error('Some error'))
      .mockResolvedValueOnce({});

    await expect(doSync(123, 'token', 'kilometrikisatoken', 'sessionId', true)).rejects.toThrowError('Failed to sync');
  });
});
