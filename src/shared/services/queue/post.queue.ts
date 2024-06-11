import { IAddPostJob, IDeletePostJob, IUpdatePostJob } from '@post/interfaces/post.interface';
import { QUEUES } from '@root/shared/constants/keys';
import { BaseQueue } from '@services/queue/base.queue';
import { postWorker } from '@workers/post.worker';

export class PostQueue extends BaseQueue {
  constructor() {
    super('post');
    this.processJob<IAddPostJob>(QUEUES.ADD_POST_TO_DB, 5, postWorker.addPostToDb);
    this.processJob<IDeletePostJob>(QUEUES.DELETE_POST_FROM_DB, 5, postWorker.deletePostFromDb);
    this.processJob<IUpdatePostJob>(QUEUES.UPDATE_POST_IN_DB, 5, postWorker.updatePostInDb);
  }

  public savePostToDbJob(data: IAddPostJob) {
    this.addJob<IAddPostJob>(QUEUES.ADD_POST_TO_DB, data);
  }

  public deletePostInDbJob(data: IDeletePostJob) {
    this.addJob<IDeletePostJob>(QUEUES.DELETE_POST_FROM_DB, data);
  }

  public updatePostInDbJob(data: IUpdatePostJob) {
    this.addJob<IUpdatePostJob>(QUEUES.UPDATE_POST_IN_DB, data);
  }
}

export const postQueue = new PostQueue();
