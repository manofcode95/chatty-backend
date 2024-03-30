import { ServerError } from '@globals/helpers/error-handler';
import { parseJson } from '@root/shared/globals/helpers/utils';
import { BaseCache } from '@services/redis/base.cache';
import { IUserDocument } from '@user/interfaces/user.interface';

export class UserCache extends BaseCache {
  constructor() {
    super('userCache');
  }

  public async saveUserToCache(key: string, userUId: string, createdUser: IUserDocument): Promise<void> {
    console.log(123456);
    const createdAt = new Date();
    const {
      _id,
      uId,
      username,
      email,
      avatarColor,
      blocked,
      blockedBy,
      postsCount,
      profilePicture,
      followersCount,
      followingCount,
      notifications,
      work,
      location,
      school,
      quote,
      bgImageId,
      bgImageVersion,
      social
    } = createdUser;

    const dataToSave = {
      _id: `${_id}`,
      uId: `${uId}`,
      username: `${username}`,
      email: `${email}`,
      avatarColor: `${avatarColor}`,
      createdAt: `${createdAt}`,
      postsCount: `${postsCount}`,
      blocked: JSON.stringify(blocked),
      blockedBy: JSON.stringify(blockedBy),
      profilePicture: `${profilePicture}`,
      followersCount: `${followersCount}`,
      followingCount: `${followingCount}`,
      notifications: JSON.stringify(notifications),
      social: JSON.stringify(social),
      work: `${work}`,
      location: `${location}`,
      school: `${school}`,
      quote: `${quote}`,
      bgImageVersion: `${bgImageVersion}`,
      bgImageId: `${bgImageId}`
    };

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.ZADD('user', { score: parseInt(userUId, 10), value: `${key}` });
      await this.client.HSET(`users:${key}`, dataToSave);
    } catch (error) {
      this.log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getUserFromCache(userId: string): Promise<IUserDocument | null> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const cachedUser: IUserDocument = (await this.client.hGetAll(`users:${userId}`)) as unknown as IUserDocument;
      cachedUser.createdAt = new Date(parseJson(`${cachedUser.createdAt}`));
      cachedUser.postsCount = parseJson(`${cachedUser.postsCount}`);
      cachedUser.blocked = parseJson(`${cachedUser.blocked}`);
      cachedUser.blockedBy = parseJson(`${cachedUser.blockedBy}`);
      cachedUser.notifications = parseJson(`${cachedUser.notifications}`);
      cachedUser.social = parseJson(`${cachedUser.social}`);
      cachedUser.followersCount = parseJson(`${cachedUser.followersCount}`);
      cachedUser.followingCount = parseJson(`${cachedUser.followingCount}`);

      return cachedUser;
    } catch (err) {
      this.log.error(err);
      throw new ServerError('Server error. Try again.');
    }
  }
}

export const userCache = new UserCache();
