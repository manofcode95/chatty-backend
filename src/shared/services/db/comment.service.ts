/* eslint-disable @typescript-eslint/no-unused-vars */
import { ICommentDocument, ISaveCommentJob, ICommentNameList, IQueryComment } from '@comment/interfaces/comment.interface';
import { CommentsModel } from '@comment/models/comment.model';
import { PostModel } from '@post/models/post.model';
import { emailQueue } from '@services/queue/email.queue';
import { notificationQueue } from '@services/queue/notification.queue';

class CommentService {
  public async addCommentToDb(commentData: ISaveCommentJob): Promise<void> {
    const { user, comment } = commentData;

    await Promise.all([
      CommentsModel.create(comment),
      PostModel.findOneAndUpdate({ _id: comment.postId }, { $inc: { commentsCount: 1 } }, { new: true })
    ]);

    notificationQueue.sendCommentNotification({ user, comment });

    emailQueue.notifyCommentByEmailJob({ user, comment });
  }

  public async getPostComments(query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentDocument[]> {
    const comments: ICommentDocument[] = await CommentsModel.aggregate([{ $match: query }, { $sort: sort }]);
    return comments;
  }

  public async getPostCommentNames(query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentNameList> {
    const commentsNamesList: ICommentNameList[] = await CommentsModel.aggregate([
      { $match: query },
      { $sort: sort },
      { $group: { _id: null, names: { $addToSet: '$username' }, count: { $sum: 1 } } },
      { $project: { _id: 0 } }
    ]);

    return commentsNamesList[0];
  }
}

export const commentService: CommentService = new CommentService();
