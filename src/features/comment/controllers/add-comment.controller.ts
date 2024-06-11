import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ICommentDocument, ISaveCommentJob } from '@comment/interfaces/comment.interface';
import { commentQueue } from '@services/queue/comment.queue';
import * as mongoose from 'mongoose';
import { commentCache } from '@services/redis/comment.cache';
import { postCache } from '@services/redis/post.cache';
import { userCache } from '@services/redis/user.cache';

class AddCommentController {
  public async addComment(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const { comment } = req.body;
    const [post, userFrom] = await Promise.all([postCache.getPostFromCache(postId), userCache.getUserFromCache(req.currentUser!.userId)]);

    const commentObjectId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId();
    const commentDoc: ICommentDocument = {
      _id: commentObjectId,
      postId,
      username: userFrom.username,
      avatarColor: userFrom.avatarColor,
      profilePicture: userFrom.profilePicture,
      comment,
      userTo: post.userId,
      createdAt: new Date()
    } as ICommentDocument;

    await commentCache.savePostCommentToCache(commentDoc);

    const databaseCommentData: ISaveCommentJob = {
      user: userFrom,
      comment: commentDoc
    };

    commentQueue.saveCommentToDbJob(databaseCommentData);

    res.status(HTTP_STATUS.OK).json({ message: 'Comment created successfully' });
  }
}

export const addCommentController = new AddCommentController();
