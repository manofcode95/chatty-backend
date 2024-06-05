import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { followerService } from '@services/db/follower.service';
import { config } from '@root/config';

const log: Logger = config.createLogger('followerWorker');

class FollowerWorker {
  async addFollowerToDb(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { userId, followerId, username, followerDocumentId } = job.data;
      await followerService.addFollower(userId, followerId, username, followerDocumentId);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async removeFollowerFromDb(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { userId, followerId } = job.data;
      await followerService.removeFollower(userId, followerId);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const followerWorker: FollowerWorker = new FollowerWorker();
