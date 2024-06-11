import { IAddPostJob, IDeletePostJob, IUpdatePostJob } from '@post/interfaces/post.interface';
import { config } from '@root/config';
import { postService } from '@services/db/post.service';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';

const log: Logger = config.createLogger('postWorker');

export class PostWorker {
  async addPostToDb(job: Job<IAddPostJob>, done: DoneCallback) {
    try {
      const { userId, post } = job.data;
      await postService.createPost(userId, post);
      job.progress(100);
      done(null, job.data);
    } catch (err) {
      log.error(err);
      done(err as Error);
    }
  }

  async deletePostFromDb(job: Job<IDeletePostJob>, done: DoneCallback): Promise<void> {
    try {
      const { postId, userId } = job.data;
      await postService.deletePost(postId, userId);
      job.progress(100);
      done(null, job.data);
    } catch (err) {
      log.error(err);
      done(err as Error);
    }
  }

  async updatePostInDb(job: Job<IUpdatePostJob>, done: DoneCallback): Promise<void> {
    try {
      const { postId, post } = job.data;
      await postService.updatePost(postId, post);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const postWorker = new PostWorker();
