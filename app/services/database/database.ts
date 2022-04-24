import mongoose from 'mongoose';
import { isDev } from '../../helpers/helpers';

export function getDbConnection() {
  const connectionString =
    `${isDev() ? 'mongodb://' : 'mongodb+srv://'}` +
    process.env.KILOMETRIKISA_DBUSER +
    ':' +
    process.env.KILOMETRIKISA_DBPASSWORD +
    '@' +
    process.env.KILOMETRIKISA_DBHOST +
    '/' +
    process.env.KILOMETRIKISA_DB +
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
