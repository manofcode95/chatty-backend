import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { followerService } from '@services/db/follower.service';
import { config } from '@root/config';
import { IAddFollowerJob, IRemoveFollowerJob } from '@follower/interfaces/follower.interface';

const log: Logger = config.createLogger('followerWorker');

class FollowerWorker {
  async addFollowerToDB(job: Job<IAddFollowerJob>, done: DoneCallback): Promise<void> {
    try {
      const { followee, follower, followerDocumentId } = job.data;
      await followerService.addFollower(followee, follower, followerDocumentId);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async removeFollowerFromDB(job: Job<IRemoveFollowerJob>, done: DoneCallback): Promise<void> {
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
