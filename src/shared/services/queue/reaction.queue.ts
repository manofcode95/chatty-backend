import { IReactionJob } from '@root/features/reaction/interfaces/reaction.interface';
import { BaseQueue } from '@services/queue/base.queue';
import { reactionWorker } from '@workers/reaction.worker';

class ReactionQueue extends BaseQueue {
  constructor() {
    super('reaction');
    this.processJob('addReactionToDb', 5, reactionWorker.addReactionToDb);
    this.processJob('removeReactionFromDb', 5, reactionWorker.removeReactionFromDb);
  }

  public addReactionJob(name: string, data: IReactionJob) {
    this.addJob(name, data);
  }
}

export const reactionQueue = new ReactionQueue();
