import { ISaveCommentJob } from '@comment/interfaces/comment.interface';
import { QUEUES } from '@root/shared/constants/keys';
import { BaseQueue } from '@services/queue/base.queue';
import { commentWorker } from '@workers/comment.worker';

class CommentQueue extends BaseQueue {
  constructor() {
    super('comments');
    this.processJob<ISaveCommentJob>(QUEUES.ADD_COMMENT_TO_DB, 5, commentWorker.addCommentToDB);
  }

  public saveCommentToDBJob(data: ISaveCommentJob) {
    this.addJob<ISaveCommentJob>(QUEUES.ADD_COMMENT_TO_DB, data);
  }
}

export const commentQueue: CommentQueue = new CommentQueue();
