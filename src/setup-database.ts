import mongoose from 'mongoose';
import { config } from '@root/config';
import 'joi';
import 'joi-extract-type';
import { redisConnection } from '@services/redis/redis.connection';

const log = config.createLogger('database');

export function connectDatabase() {
  return mongoose
    .connect(config.DATABASE_URL!)
    .then((res) => {
      log.info('Successfully connected to database');
      redisConnection.connect();
    })
    .catch((err) => {
      log.error('Failed to connect to database', err);
      return process.exit(1);
    });
}
