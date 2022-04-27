import { findUser, User, UserModel } from './UserModel';
import { disconnectDb, getDbConnection } from '../services/database/in-memory-database';
import { secrets } from '../environment';

describe('UserModel', () => {
  beforeEach(async () => {
    secrets.kilometrikisaCryptoPassword = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    await getDbConnection();
  });

  afterEach(async () => {
    await disconnectDb();
  });

  describe('encryption', () => {
    it('should encrypt the user password and decrypt it after being fetched from the db', async () => {
      const stravaUserId = 1234;
      const user = new UserModel();

      user.set('stravaUserId', stravaUserId);
      user.setPassword('hunter2');
      await user.save();

      const userFromDb: User = await findUser({ stravaUserId });
      expect(userFromDb.kilometrikisaPassword).not.toBeFalsy();
      expect(userFromDb.kilometrikisaPassword).not.toEqual('hunter2');

      expect(userFromDb.getPassword()).toEqual('hunter2');
    });

    it('should not decrypt password which has been saved with different crypto key', async () => {
      const user = new UserModel();
      user.setPassword('hunter2');

      expect(user.getPassword()).toEqual('hunter2');

      // Change the key
      secrets.kilometrikisaCryptoPassword = 'baaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
      expect(user.getPassword()).not.toEqual('hunter2');
    });
  });
});
