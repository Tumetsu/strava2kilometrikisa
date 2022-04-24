import mongoose from 'mongoose';
import { isDev } from '../../helpers/helpers';
import { env, secrets } from '../../environment';

export function getDbConnection() {
  const connectionString =
    `${isDev() ? 'mongodb://' : 'mongodb+srv://'}` +
    env.dbUser +
    ':' +
    secrets.dbPassword +
    '@' +
    env.dbHost +
    '/' +
    env.dbName +
    '?retryWrites=true&w=majority';

  // Connect to MongoDB.
  const options: {
    useNewUrlParser: boolean;
    useUnifiedTopology: boolean;
    authSource?: string;
  } = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  if (isDev()) {
    options.authSource = 'admin';
  }

  return mongoose.connect(connectionString, options);
}

export function disconnectDb() {
  return mongoose.disconnect();
}
