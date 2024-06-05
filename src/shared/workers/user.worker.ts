import { config } from '@root/config';
import { userService } from '@services/db/user.service';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';

const log: Logger = config.createLogger('userWorker');

export class UserWorker {
  async addUserToDb(job: Job, done: DoneCallback) {
    try {
      const { value } = job.data;
      await userService.createUser(value);
      job.progress(100);
      done(null, job.data);
    } catch (err) {
      log.error(err);
      done(err as Error);
    }
  }

  async addBlockedUserToDb(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { userId, blockedId, type } = job.data;
      if (type === 'block') {
        await userService.blockUser(userId, blockedId);
      } else {
        await userService.unblockUser(userId, blockedId);
      }
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const userWorker = new UserWorker();
