import { BaseCache } from '@services/redis/base.cache';
import mongoose from 'mongoose';
import { ServerError } from '@globals/helpers/error-handler';
import { IFollowerData } from '@follower/interfaces/follower.interface';
import { userCache } from '@services/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';

export class FollowerCache extends BaseCache {
  constructor() {
    super('followersCache');
  }

  public async updateFollowCountInCache(userId: string, followerId: string, followState: boolean): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const multi: ReturnType<typeof this.client.multi> = this.client.multi();

      multi.HINCRBY(`users:${followerId}`, 'followersCount', followState ? 1 : -1);
      multi.HINCRBY(`users:${userId}`, 'followingCount', followState ? 1 : -1);

      if (followState) {
        multi.LPUSH(`followings:${userId}`, `${followerId}`);
        multi.LPUSH(`followers:${followerId}`, `${userId}`);
      } else {
        multi.LREM(`followings:${userId}`, 1, `${followerId}`);
        multi.LREM(`followers:${followerId}`, 1, `${userId}`);
      }

      await multi.exec();
    } catch (error) {
      this.log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getFollowsFromCache(key: string): Promise<IFollowerData[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const response: string[] = await this.client.LRANGE(key, 0, -1);
      const userPromises = response.map((item) => userCache.getUserFromCache(item));
      const users = (await Promise.all(userPromises)) as IUserDocument[];

      const list: IFollowerData[] = users.map((user) => ({
        _id: new mongoose.Types.ObjectId(user._id),
        username: user.username!,
        avatarColor: user.avatarColor!,
        postCount: user.postsCount,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        profilePicture: user.profilePicture,
        uId: user.uId!,
        userProfile: user
      }));

      return list;
    } catch (error) {
      this.log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getFollowersFromCache(userId: string): Promise<IFollowerData[]> {
    return await this.getFollowsFromCache(`followers:${userId}`);
  }

  public async getFollowingsFromCache(userId: string): Promise<IFollowerData[]> {
    return await this.getFollowsFromCache(`followings:${userId}`);
  }
}

export const followerCache = new FollowerCache();
