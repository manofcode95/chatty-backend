import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { joiValidation } from '@globals/decorators/joi-validation.decorator';
import { addCommentSchema } from '@comment/schemes/comment.scheme';
import { ICommentDocument, ICommentJob } from '@comment/interfaces/comment.interface';
import { commentQueue } from '@services/queue/comment.queue';
import * as mongoose from 'mongoose';
import { commentCache } from '@services/redis/comment.cache';

class AddCommentController {
  @joiValidation(addCommentSchema)
  public async addComment(req: Request, res: Response): Promise<void> {
    const { userTo, postId, profilePicture, comment } = req.body;
    const commentObjectId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId();
    const commentData: ICommentDocument = {
      _id: commentObjectId,
      postId,
      username: `${req.currentUser?.username}`,
      avatarColor: `${req.currentUser?.avatarColor}`,
      profilePicture,
      comment,
      createdAt: new Date()
    } as ICommentDocument;

    await commentCache.savePostCommentToCache(postId, commentData);

    const databaseCommentData: ICommentJob = {
      postId,
      userTo,
      userFrom: req.currentUser!.userId,
      username: req.currentUser!.username,
      comment: commentData
    };

    commentQueue.addCommentJob('addCommentToDb', databaseCommentData);

    res.status(HTTP_STATUS.OK).json({ message: 'Comment created successfully' });
  }
}

export const addCommentController = new AddCommentController();
