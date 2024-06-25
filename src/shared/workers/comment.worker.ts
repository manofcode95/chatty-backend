import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { commentService } from '@services/db/comment.service';
import { config } from '@root/config';
import { ISaveCommentJob } from '@comment/interfaces/comment.interface';

const log: Logger = config.createLogger('commentWorker');

class CommentWorker {
  async addCommentToDB(job: Job<ISaveCommentJob>, done: DoneCallback): Promise<void> {
    try {
      const { data } = job;
      await commentService.addCommentToDB(data);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const commentWorker: CommentWorker = new CommentWorker();
