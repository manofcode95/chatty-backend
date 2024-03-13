import mongoose from 'mongoose';
import { config } from './config';

const log = config.createLogger('database');

export function connectDatabase() {
  return mongoose
    .connect(config.DATABASE_URL!)
    .then(() => {
      log.info('Successfully connected to database');
    })
    .catch((err) => {
      log.error('Failed to connect to database', err);
      return process.exit(1);
    });
}
