import { IReactionDocument } from '@reaction/interfaces/reaction.interface';
import { reactionService } from '@services/db/reaction.service';
import { reactionCache } from '@services/redis/reaction.cache';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';

export class GetReactionController {
  public async getReactions(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    let reactions: { list: IReactionDocument[]; length: number };

    try {
      reactions = await reactionCache.getReactionsFromCache(postId);
    } catch {
      reactions = await reactionService.getPostReactions({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 });
    }

    res.status(HTTP_STATUS.OK).json({ message: 'Post reactions', reactions: reactions.list, count: reactions.length });
  }

  public async getSingleReactionByUsername(req: Request, res: Response): Promise<void> {
    const { postId, username } = req.params;
    let reaction: IReactionDocument | undefined;

    try {
      reaction = await reactionCache.getSingleReactionByUsernameFromCache(postId, username);
    } catch {
      reaction = await reactionService.getSinglePostReactionByUsername(new mongoose.Types.ObjectId(postId), username);
    }

    res.status(HTTP_STATUS.OK).json({
      message: 'Single post reaction by username',
      reaction
    });
  }

  public async getReactionsByUsername(req: Request, res: Response): Promise<void> {
    const { username } = req.params;
    const reactions = await reactionService.getReactionsByUsername(username);
    res.status(HTTP_STATUS.OK).json({ message: 'All user reactions by username', reactions: reactions.list, count: reactions.length });
  }
}

export const getReactionController = new GetReactionController();
