import { IPostJobData } from '@post/interfaces/post.interface';
import { BaseQueue } from '@services/queue/base.queue';
import { postWorker } from '@workers/post.worker';

export class PostQueue extends BaseQueue {
  constructor() {
    super('post');
    this.processJob('addPostToDb', 5, postWorker.addPostToDb);
    this.processJob('deletePostFromDb', 5, postWorker.deletePostFromDb);
    this.processJob('updatePostInDb', 5, postWorker.updatePostInDb);
  }

  public addPostJob(name: string, data: IPostJobData) {
    this.addJob(name, data);
  }
}

export const postQueue = new PostQueue();
