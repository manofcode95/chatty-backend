import { config } from '@root/config';
import { authService } from '@services/db/auth.service';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';

const log: Logger = config.createLogger('authWorker');

export class AuthWorker {
  async addAuthUserToDb(job: Job, done: DoneCallback) {
    try {
      const { value } = job.data;
      await authService.createAuthUser(value);
      job.progress(100);
      done(null, job.data);
    } catch (err) {
      log.error(err);
      done(err as Error);
    }
  }
}

export const authWorker = new AuthWorker();
