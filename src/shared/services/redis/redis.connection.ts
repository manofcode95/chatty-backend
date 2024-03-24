import { BaseCache } from '@services/redis/base.cache';

export class RedisConnection extends BaseCache {
  constructor() {
    super('redisConnection');
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.log.info('Successfully connected to redis');
    } catch (err) {
      this.log.error(err);
    }
  }
}

export const redisConnection = new RedisConnection();
