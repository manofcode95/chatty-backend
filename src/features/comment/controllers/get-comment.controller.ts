import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ICommentDocument, ICommentNameList } from '@comment/interfaces/comment.interface';
import { commentService } from '@services/db/comment.service';
import mongoose from 'mongoose';
import { commentCache } from '@services/redis/comment.cache';

class GetCommentController {
  public async getComments(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    let comments: ICommentDocument[];

    try {
      comments = await commentCache.getCommentsFromCache(postId);
    } catch {
      comments = await commentService.getPostComments({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 });
    }

    res.status(HTTP_STATUS.OK).json({ message: 'Post comments', comments });
  }

  public async getCommentsNamesByPost(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;

    let commentsNames: ICommentNameList;

    try {
      commentsNames = await commentCache.getCommentsNamesFromCache(postId);
    } catch {
      commentsNames = await commentService.getPostCommentNames({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 });
    }

    res.status(HTTP_STATUS.OK).json({ message: 'Post comments names', comments: commentsNames });
  }

  public async getSingleCommentById(req: Request, res: Response): Promise<void> {
    const { postId, commentId } = req.params;
    let comment: ICommentDocument | undefined;

    try {
      comment = await commentCache.getSingleCommentFromCache(postId, commentId);
    } catch {
      const comments = await commentService.getPostComments({ _id: new mongoose.Types.ObjectId(commentId) }, { createdAt: -1 });
      comment = comments[0];
    }

    res.status(HTTP_STATUS.OK).json({ message: 'Single comment', comment });
  }
}

export const getCommentController = new GetCommentController();
