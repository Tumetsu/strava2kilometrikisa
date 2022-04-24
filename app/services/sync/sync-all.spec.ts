import { doSync } from './sync';
import { kilometrikisaSession } from 'kilometrikisa-client';
import { UserModel } from '../../models/UserModel';
import { syncAllUsers } from './sync-all';

/**
 * A very crude mock for UserModel which just resembles the actual UserModel type.
 * TODO: Get rid of this if/when database adapter is added to get rid of Mongoose specific data types in the app.
 */
function getMockUser(stravaToken = 'token') {
  return {
    //eslint-disable-next-line @typescript-eslint/no-empty-function
    set: () => {},
    updateToken: () => Promise.resolve(),
    getPassword: () => 'password',
    stravaUserId: 123,
    stravaToken,
    kilometrikisaUsername: 'username',
    kilometrikisaToken: '123',
    kilometrikisaSessionId: '123',
    ebike: false,
  };
}

jest.mock('../database/database', () => {
  return {
    getDbConnection: jest.fn().mockResolvedValue({}),
    disconnectDb: jest.fn().mockResolvedValue({}),
  };
});

jest.mock('./sync', () => {
  return {
    doSync: jest.fn(),
  };
});

jest.mock('../../models/UserModel', () => {
  return {
    UserModel: {
      find: jest.fn(),
    },
  };
});

jest.mock('kilometrikisa-client', () => {
  return {
    kilometrikisaSession: jest.fn(),
  };
});

const doSyncMock = doSync as unknown as jest.Mock;
const findMock = UserModel.find as unknown as jest.Mock;
const kilometrikisaSessionMock = kilometrikisaSession as unknown as jest.Mock;

describe('Cron sync', () => {
  beforeEach(() => {
    findMock.mockResolvedValue([getMockUser('user1'), getMockUser('user2'), getMockUser('user3')]);
    doSyncMock.mockReset().mockResolvedValue([]);
    kilometrikisaSessionMock.mockReset().mockImplementation(() => {
      return {
        sessionCredentials: { token: '123', sessionId: '12345' },
      };
    });
  });

  it('should sync all users', async () => {
    expect(doSyncMock.mock.calls.length).toEqual(0);

    // Set throttle to minimum so that the whole process runs during the test.
    // Perhaps one could use Jest fake timers here instead?
    await syncAllUsers(1);

    // Sync called for all users
    expect(doSyncMock.mock.calls.length).toEqual(3);
    expect(doSyncMock.mock.calls[0][1]).toEqual('user1');
    expect(doSyncMock.mock.calls[1][1]).toEqual('user2');
    expect(doSyncMock.mock.calls[2][1]).toEqual('user3');
  });

  it('should sync other users even if login fails for one', async () => {
    // Setup login to fail once
    kilometrikisaSessionMock.mockRejectedValueOnce(new Error('Fail'));

    await syncAllUsers(1);

    // Sync called for other users
    expect(doSyncMock.mock.calls.length).toEqual(2);
    expect(doSyncMock.mock.calls[0][1]).toEqual('user2');
    expect(doSyncMock.mock.calls[1][1]).toEqual('user3');
  });

  it('should sync other users even if syncing fails for one', async () => {
    // Setup syncing to fail once
    doSyncMock.mockRejectedValueOnce(new Error('Fail')).mockResolvedValue([]);

    await syncAllUsers(1);

    // Sync called for all users
    expect(doSyncMock.mock.calls.length).toEqual(3);
    expect(doSyncMock.mock.calls[0][1]).toEqual('user1');
    expect(doSyncMock.mock.calls[1][1]).toEqual('user2');
    expect(doSyncMock.mock.calls[2][1]).toEqual('user3');

    // Results of each call vary a bit. First one should have rejected but others should have completed fine
    await expect(doSyncMock.mock.results[0].value).rejects.toThrowError('Fail');
    await expect(doSyncMock.mock.results[1].value).resolves.toEqual([]);
    await expect(doSyncMock.mock.results[2].value).resolves.toEqual([]);
  });
});
