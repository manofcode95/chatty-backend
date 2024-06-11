import { IAddReactionJob, IRemoveReactionJob } from '@reaction/interfaces/reaction.interface';
import { config } from '@root/config';
import { reactionService } from '@services/db/reaction.service';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';

const log: Logger = config.createLogger('reactionWorker');

export class ReactionWorker {
  async addReactionToDb(job: Job<IAddReactionJob>, done: DoneCallback) {
    try {
      const { data } = job;
      await reactionService.saveReaction(data);
      job.progress(100);
      done(null, job.data);
    } catch (err) {
      log.error(err);
      done(err as Error);
    }
  }

  async removeReactionFromDb(job: Job<IRemoveReactionJob>, done: DoneCallback) {
    try {
      const { data } = job;
      await reactionService.removeReaction(data);
      job.progress(100);
      done(null, data);
    } catch (err) {
      log.error(err);
      done(err as Error);
    }
  }
}

export const reactionWorker = new ReactionWorker();
