import mongoose, { FilterQuery } from 'mongoose';
import crypto from 'crypto';
import strava from 'strava-v3';
import logger from '../helpers/logger';
import HttpException from '../helpers/exceptions';
import { secrets } from '../environment';

const algorithm = 'aes-256-ctr';
const cryptoPassword = secrets.kilometrikisaCryptoPassword;

export interface User extends mongoose.Document {
  stravaUserId: number;
  stravaToken: string;
  tokenExpire: number;
  refreshToken: string;
  kilometrikisaToken: string;
  kilometrikisaSessionId: string;
  kilometrikisaUsername: string;
  kilometrikisaPassword: string;
  kilometrikisaIv: string;
  autosync: boolean;
  ebike: boolean;

  updateToken: () => Promise<void>;
  setPassword: (password: string) => void;
  getPassword: () => string;
}

const UserSchema = new mongoose.Schema<User>({
  stravaUserId: { type: Number },
  stravaToken: { type: String },
  tokenExpire: { type: Number },
  refreshToken: { type: String },
  kilometrikisaToken: { type: String },
  kilometrikisaSessionId: { type: String },
  kilometrikisaUsername: { type: String },
  kilometrikisaPassword: { type: String },
  kilometrikisaIv: { type: String },

  // Sync kilometers automatically.
  autosync: { type: Boolean },

  // Sync e-bike kilometers.
  ebike: { type: Boolean },
});

// https://github.com/UnbounDev/node-strava-v3/blob/master/lib/oauth.js#L102
UserSchema.methods.updateToken = async function (this: User) {
  const d = Date.now();
  if (d > this.tokenExpire) {
    try {
      const account = await strava.oauth.refreshToken(this.refreshToken);
      this.stravaToken = account.access_token;
      this.tokenExpire = account.expires_at * 1000;
      this.refreshToken = account.refresh_token;
      await this.save();
    } catch (err) {
      logger.warn('Error updating the user token', err);
    }
  }
};

// Encrypt and set password.
UserSchema.methods.setPassword = function (this: User, password: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, cryptoPassword, iv);
  const encrypted = Buffer.concat([cipher.update(password, 'utf8'), cipher.final()]);

  this.kilometrikisaPassword = encrypted.toString('hex');
  this.kilometrikisaIv = iv.toString('hex');
};

// Decrypt and get password.
UserSchema.methods.getPassword = function (this: User) {
  const decipher = crypto.createDecipheriv(
    algorithm,
    cryptoPassword,
    Buffer.from(this.kilometrikisaIv, 'hex'),
  );

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(this.kilometrikisaPassword, 'hex')),
    decipher.final(),
  ]);

  return decrypted.toString();
};

// Create model.
export const UserModel = mongoose.model<User>('User', UserSchema);

/**
 * An utility method to fetch users and throw an exception always if one is not found.
 * @param filter
 */
export async function findUser(filter: FilterQuery<User>): Promise<User> {
  const user = await UserModel.findOne(filter);
  if (!user) {
    throw new HttpException(404, 'User not found!');
  }
  return user;
}
