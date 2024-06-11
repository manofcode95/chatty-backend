import { joiValidation } from '@globals/decorators/joi-validation.decorator';
import { IReactionDocument } from '@reaction/interfaces/reaction.interface';
import { addReactionSchema } from '@reaction/schemes/reaction.scheme';
import { reactionCache } from '@services/redis/reaction.cache';
import { Request, Response } from 'express';
import * as mongoose from 'mongoose';
import HTTP_STATUS from 'http-status-codes';
import { postCache } from '@services/redis/post.cache';
import { reactionQueue } from '@services/queue/reaction.queue';

class AddReactionController {
  @joiValidation(addReactionSchema)
  public async addReaction(req: Request, res: Response): Promise<void> {
    const { userTo, postId, type, previousReaction, profilePicture } = req.body;

    const reactionObject: IReactionDocument = {
      _id: new mongoose.Types.ObjectId(),
      postId,
      type,
      avataColor: req.currentUser!.avatarColor,
      username: req.currentUser!.username,
      profilePicture
    } as IReactionDocument;

    const postReactions = await postCache.getPostReaction(postId);

    await reactionCache.savePostReactionToCache(postId, reactionObject, postReactions, type, previousReaction);

    const databaseReactionData = {
      postId,
      userTo,
      userFrom: req.currentUser!.userId,
      username: req.currentUser!.username,
      type,
      previousReaction,
      reactionObject
    };

    reactionQueue.saveReactionToDbJob(databaseReactionData);

    res.status(HTTP_STATUS.OK).json({ message: 'Reaction added successfully' });
  }
}

export const addReactionController = new AddReactionController();
