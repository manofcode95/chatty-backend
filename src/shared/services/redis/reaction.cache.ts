import { ServerError } from '@globals/helpers/error-handler';
import { firstLetterUppercase, parseJson } from '@globals/helpers/utils';
import { IReactionDocument, IReactions } from '@root/features/reaction/interfaces/reaction.interface';
import { BaseCache } from '@services/redis/base.cache';

export class ReactionCache extends BaseCache {
  constructor() {
    super('reactionCache');
  }

  public async savePostReactionToCache(
    postId: string,
    reaction: IReactionDocument,
    postReactions: IReactions,
    type: keyof IReactions,
    previousReaction: keyof IReactions
  ): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      if (previousReaction) {
        await this.removePostReactionFromCache(postId, reaction.username, { ...postReactions, [type]: postReactions[previousReaction]-- });
      }

      if (type) {
        const multi: ReturnType<typeof this.client.multi> = this.client.multi();

        multi.LPUSH(`reactions:${postId}`, JSON.stringify({ ...reaction, _id: reaction._id?.toString() }));
        multi.HSET(`posts:${postId}`, 'reactions', JSON.stringify({ ...postReactions, [type]: postReactions[type] + 1 }));

        await multi.exec();
      }
    } catch (error) {
      this.log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async removePostReactionFromCache(postId: string, username: string, postReactions: IReactions) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const rawReactions: string[] = await this.client.LRANGE(`reactions:${postId}`, 0, -1);

      const reactions: IReactionDocument[] = [];

      for (const item of rawReactions) {
        reactions.push(parseJson(item) as IReactionDocument);
      }

      const previousReaction = this.getPreviousReaction(reactions, username);

      const multi: ReturnType<typeof this.client.multi> = this.client.multi();

      multi.LREM(`reactions:${postId}`, 1, JSON.stringify(previousReaction));

      multi.HSET(`posts:${postId}`, 'reactions', JSON.stringify(postReactions));

      await multi.exec();
    } catch (error) {
      this.log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getReactionsFromCache(postId: string): Promise<{ list: IReactionDocument[]; length: number }> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const length: number = await this.client.LLEN(`reactions:${postId}`);
      const response: string[] = await this.client.LRANGE(`reactions:${postId}`, 0, -1);
      const list: IReactionDocument[] = [];
      for (const item of response) {
        list.push(parseJson(item));
      }
      return { list, length };
    } catch (error) {
      this.log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getSingleReactionByUsernameFromCache(postId: string, username: string): Promise<IReactionDocument | undefined> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      username = firstLetterUppercase(username);
      const response: string[] = await this.client.LRANGE(`reactions:${postId}`, 0, -1);
      const list: IReactionDocument[] = [];
      for (const item of response) {
        list.push(parseJson(item));
      }
      const result: IReactionDocument | undefined = list.find((item) => item.postId === postId && item.username === username);

      return result;
    } catch (error) {
      this.log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  private getPreviousReaction(reactions: IReactionDocument[], username: string): IReactionDocument | undefined {
    return reactions.find((listItem: IReactionDocument) => {
      return listItem.username === username;
    });
  }
}

export const reactionCache = new ReactionCache();
