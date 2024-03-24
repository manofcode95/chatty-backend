import { createClient } from 'redis';
import Logger from 'bunyan';
import { config } from '@root/config';

type RedisClient = ReturnType<typeof createClient>;
export abstract class BaseCache {
  client: RedisClient;
  log: Logger;

  constructor(cacheName: string) {
    this.client = createClient({ url: config.REDIS_HOST });
    this.log = config.createLogger(cacheName);
    this.cacheError();
  }

  private cacheError() {
    this.client.on('error', (err: unknown) => {
      this.log.error(err);
    });
  }
}
