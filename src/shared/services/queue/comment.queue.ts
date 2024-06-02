import { ICommentJob } from '@comment/interfaces/comment.interface';
import { BaseQueue } from '@services/queue/base.queue';
import { commentWorker } from '@workers/comment.worker';

class CommentQueue extends BaseQueue {
  constructor() {
    super('comments');
    this.processJob('addCommentToDb', 5, commentWorker.addCommentToDb);
  }

  public addCommentJob(name: string, data: ICommentJob): void {
    this.addJob(name, data);
  }
}

export const commentQueue: CommentQueue = new CommentQueue();
