import { PostModel } from '@post/models/post.schema';
import { IQueryReaction, IReactionDocument, IReactionJob } from '@root/features/reaction/interfaces/reaction.interface';
import { ReactionModel } from '@reaction/models/reaction.schema';
import { userCache } from '@services/redis/user.cache';
import { omit } from 'lodash';
import mongoose from 'mongoose';
import { firstLetterUppercase } from '@globals/helpers/utils';

class ReactionService {
  public async saveReaction(reactionData: IReactionJob): Promise<void> {
    const { postId, previousReaction, username, reactionObject, type, userFrom, userTo } = reactionData;

    try {
      await Promise.all([
        userCache.getUserFromCache(`${userTo}`),
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
      ]);
    } catch (err) {
      console.log(err);
    }

    // send notification
  }

  public async removeReaction(reactionData: IReactionJob): Promise<void> {
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
