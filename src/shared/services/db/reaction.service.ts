import { PostModel } from '@post/models/post.model';
import {
  IAddReactionJob,
  IQueryReaction,
  IReactionDocument,
  IRemoveReactionJob
} from '@root/features/reaction/interfaces/reaction.interface';
import { ReactionModel } from '@reaction/models/reaction.model';
import { omit } from 'lodash';
import mongoose from 'mongoose';
import { firstLetterUppercase } from '@globals/helpers/utils';
import { notificationQueue } from '@services/queue/notification.queue';
import { IPostDocument } from '@post/interfaces/post.interface';

class ReactionService {
  public async saveReaction(reactionData: IAddReactionJob): Promise<void> {
    const { postId, previousReaction, username, reactionObject, type, userFrom, userTo } = reactionData;

    const [reaction, post]: [IReactionDocument, IPostDocument] = (await Promise.all([
      ReactionModel.replaceOne({ postId, username, type: previousReaction }, omit(reactionObject, ['_id']), { upsert: true }),
      PostModel.findOneAndUpdate(
        {
          _id: postId
        },
        {
          $inc: {
            [`reactions.${previousReaction}`]: -1,
            [`reactions.${type}`]: 1
          }
        },
        { new: true }
      )
    ])) as unknown as [IReactionDocument, IPostDocument];

    notificationQueue.sendReactionNotification({ reaction, post, userFromId: userFrom, userToId: userTo });
  }

  public async removeReaction(reactionData: IRemoveReactionJob): Promise<void> {
    const { postId, previousReaction, username } = reactionData;

    await Promise.all([
      ReactionModel.deleteOne({ postId, username, type: previousReaction }),
      PostModel.updateOne(
        {
          _id: postId
        },
        {
          $inc: {
            [`reactions.${previousReaction}`]: -1
          }
        },
        { new: true }
      )
    ]);
  }

  public async getPostReactions(
    query: IQueryReaction,
    sort: Record<string, 1 | -1>
  ): Promise<{ list: IReactionDocument[]; length: number }> {
    const reactions: IReactionDocument[] = await ReactionModel.aggregate([{ $match: query }, { $sort: sort }]);
    return { list: reactions, length: reactions.length };
  }

  public async getSinglePostReactionByUsername(postId: mongoose.Types.ObjectId, username: string): Promise<IReactionDocument | undefined> {
    const reactions: IReactionDocument[] = await ReactionModel.aggregate([
      { $match: { postId, username: firstLetterUppercase(username) } }
    ]);

    return reactions[0];
  }

  public async getReactionsByUsername(username: string): Promise<{ list: IReactionDocument[]; length: number }> {
    const reactions: IReactionDocument[] = await ReactionModel.aggregate([{ $match: { username: firstLetterUppercase(username) } }]);
    return { list: reactions, length: reactions.length };
  }
}

export const reactionService = new ReactionService();
