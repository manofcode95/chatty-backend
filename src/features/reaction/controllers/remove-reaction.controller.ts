import { parseJson } from '@globals/helpers/utils';
import { QUEUES } from '@root/shared/constants/keys';
import { reactionQueue } from '@services/queue/reaction.queue';
import { postCache } from '@services/redis/post.cache';
import { reactionCache } from '@services/redis/reaction.cache';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

class RemoveReactionController {
  public async removeReaction(req: Request, res: Response): Promise<void> {
    const { postId, type } = req.params;
    const username = req.currentUser!.username;
    const postReactionsRaw = await postCache.getPostReaction(postId);
    const postReactions = parseJson(postReactionsRaw);
    const updatedReactions = { ...postReactions, [type]: postReactions[type] - 1 };

    await reactionCache.removePostReactionFromCache(postId, username, updatedReactions);

    reactionQueue.removeReactionInDBJob({ postId, username, previousReaction: type });

    res.status(HTTP_STATUS.OK).json({ message: 'Reaction removed from post' });
  }
}

export const removeReactionController = new RemoveReactionController();
