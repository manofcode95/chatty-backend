import { ServerError } from '@globals/helpers/error-handler';
import { parseJson } from '@globals/helpers/utils';
import { IPostDocument, IReactions, ISavePostToCache } from '@post/interfaces/post.interface';
import { BaseCache } from '@services/redis/base.cache';

export class PostCache extends BaseCache {
  constructor() {
    super('postCache');
  }

  public async savePostToCache(data: ISavePostToCache): Promise<void> {
    const { key, currentUserId, uId, createdPost } = data;
    const {
      _id,
      userId,
      username,
      email,
      avatarColor,
      profilePicture,
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      commentsCount,
      imgVersion,
      imgId,
      videoId,
      videoVersion,
      reactions,
      createdAt
    } = createdPost;

    const dataToSave = {
      _id: `${_id}`,
      userId: `${userId}`,
      username: `${username}`,
      email: `${email}`,
      avatarColor: `${avatarColor}`,
      profilePicture: `${profilePicture}`,
      post: `${post}`,
      bgColor: `${bgColor}`,
      feelings: `${feelings}`,
      privacy: `${privacy}`,
      gifUrl: `${gifUrl}`,
      commentsCount: `${commentsCount}`,
      reactions: JSON.stringify(reactions),
      imgVersion: `${imgVersion}`,
      imgId: `${imgId}`,
      videoId: `${videoId}`,
      videoVersion: `${videoVersion}`,
      createdAt: `${createdAt}`
    };

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      multi.ZADD('post', { score: parseInt(uId, 10), value: `${key}` });
      multi.HSET(`posts:${key}`, dataToSave);
      multi.HINCRBY(`users:${currentUserId}`, 'postsCount', 1);

      await multi.exec();
    } catch (error) {
      this.log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getPostsFromCache(key: string, start: number, end: number): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const postIds: string[] = await this.client.zRange(key, start, end, { REV: true });

      const multi: ReturnType<typeof this.client.multi> = this.client.multi();

      for (const postId of postIds) {
        multi.hGetAll(`posts:${postId}`);
      }

      const posts: IPostDocument[] = [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawPosts: IPostDocument[] = (await multi.exec()) as any as IPostDocument[];

      for (const rawPost of rawPosts) {
        rawPost.commentsCount = parseJson(rawPost.commentsCount) as number;
        rawPost.reactions = parseJson(rawPost.reactions) as IReactions;
        rawPost.createdAt = new Date(rawPost.createdAt as Date);
        posts.push(rawPost);
      }

      return posts;
    } catch (err) {
      this.log.error(err);
      throw new ServerError('Server error. Try again');
    }
  }

  public async getPostsWithImagesFromCache(key: string, start: number, end: number): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const postIds: string[] = await this.client.zRange(key, start, end, { REV: true });

      const multi: ReturnType<typeof this.client.multi> = this.client.multi();

      for (const postId of postIds) {
        multi.hGetAll(`posts:${postId}`);
      }

      const postsWithImage: IPostDocument[] = [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawPosts: IPostDocument[] = (await multi.exec()) as any as IPostDocument[];

      for (const rawPost of rawPosts) {
        if ((rawPost.imgId && rawPost.imgVersion) || rawPost.gifUrl) {
          rawPost.commentsCount = parseJson(rawPost.commentsCount) as number;
          rawPost.reactions = parseJson(rawPost.reactions) as IReactions;
          rawPost.createdAt = new Date(rawPost.createdAt as Date);
          postsWithImage.push(rawPost);
        }
      }

      return postsWithImage;
    } catch (err) {
      this.log.error(err);
      throw new ServerError('Server error. Try again');
    }
  }

  public async getPostsWithVideosFromCache(key: string, start: number, end: number): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const postIds: string[] = await this.client.zRange(key, start, end, { REV: true });

      const multi: ReturnType<typeof this.client.multi> = this.client.multi();

      for (const postId of postIds) {
        multi.hGetAll(`posts:${postId}`);
      }

      const postsWithVideo: IPostDocument[] = [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawPosts: IPostDocument[] = (await multi.exec()) as any as IPostDocument[];

      for (const rawPost of rawPosts) {
        if (rawPost.videoId && rawPost.videoVersion) {
          rawPost.commentsCount = parseJson(rawPost.commentsCount) as number;
          rawPost.reactions = parseJson(rawPost.reactions) as IReactions;
          rawPost.createdAt = new Date(rawPost.createdAt as Date);
          postsWithVideo.push(rawPost);
        }
      }

      return postsWithVideo;
    } catch (err) {
      this.log.error(err);
      throw new ServerError('Server error. Try again');
    }
  }

  public async getUserPostsFromCache(key: string, uId: string): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const postIds = await this.client.zRange(key, uId, uId, { REV: true, BY: 'SCORE' });
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();

      for (const postId of postIds) {
        multi.hGetAll(`posts:${postId}`);
      }

      const posts: IPostDocument[] = [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawPosts: IPostDocument[] = (await multi.exec()) as any as IPostDocument[];

      for (const rawPost of rawPosts) {
        if (rawPost.imgId && rawPost.imgVersion) {
          rawPost.commentsCount = parseJson(rawPost.commentsCount) as number;
          rawPost.reactions = parseJson(rawPost.reactions) as IReactions;
          rawPost.createdAt = new Date(rawPost.createdAt as Date);
          posts.push(rawPost);
        }
      }

      return posts;
    } catch (err) {
      this.log.error(err);
      throw new ServerError('Server error. Try again');
    }
  }

  public async getTotalPostsInCache(): Promise<number> {
    if (!this.client.isOpen) {
      await this.client.connect();
    }

    try {
      const count = await this.client.zCard('post');
      return count;
    } catch (err) {
      this.log.error(err);
      throw new ServerError('Server error. Try again');
    }
  }

  public async getTotalUserPostsFromCache(uId: string): Promise<number> {
    if (!this.client.isOpen) {
      await this.client.connect();
    }

    try {
      const count = await this.client.zCount('post', uId, uId);
      return count;
    } catch (err) {
      this.log.error(err);
      throw new ServerError('Server error. Try again');
    }
  }

  public async deletePostFromCache(key: string, currentUserId: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      multi.ZREM('post', `${key}`);
      multi.DEL(`posts:${key}`);
      // multi.DEL(`comments:${key}`);
      // multi.DEL(`reactions:${key}`);
      multi.HINCRBY(`users:${currentUserId}`, 'postsCount', 1);
      await multi.exec();
    } catch (error) {
      this.log.error(error);
      throw new ServerError('Server error. Try again');
    }
  }

  public async updatePostInCache(key: string, updatedPost: IPostDocument): Promise<IPostDocument> {
    const { post, bgColor, feelings, privacy, gifUrl, imgVersion, imgId, videoId, videoVersion, profilePicture } = updatedPost;
    const dataToSave = {
      post: `${post}`,
      bgColor: `${bgColor}`,
      feelings: `${feelings}`,
      privacy: `${privacy}`,
      gifUrl: `${gifUrl}`,
      videoId: `${videoId}`,
      videoVersion: `${videoVersion}`,
      profilePicture: `${profilePicture}`,
      imgVersion: `${imgVersion}`,
      imgId: `${imgId}`
    };

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      await this.client.HSET(`posts:${key}`, dataToSave);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const postReply: IPostDocument = (await this.client.HGETALL(`posts:${key}`)) as any as IPostDocument;
      postReply.commentsCount = parseJson(`${postReply.commentsCount}`) as number;
      postReply.reactions = parseJson(`${postReply.reactions}`) as IReactions;
      postReply.createdAt = new Date(parseJson(`${postReply.createdAt}`)) as Date;

      return postReply;
    } catch (error) {
      this.log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }
}

export const postCache = new PostCache();
