import { IAddReactionJob, IRemoveReactionJob } from '@reaction/interfaces/reaction.interface';
import { QUEUES } from '@root/shared/constants/keys';
import { BaseQueue } from '@services/queue/base.queue';
import { reactionWorker } from '@workers/reaction.worker';

class ReactionQueue extends BaseQueue {
  constructor() {
    super('reaction');
    this.processJob<IAddReactionJob>(QUEUES.ADD_REACTION_TO_DB, 5, reactionWorker.addReactionToDB);
    this.processJob<IRemoveReactionJob>(QUEUES.REMOVE_REACTION_FROM_DB, 5, reactionWorker.removeReactionFromDB);
  }

  public saveReactionToDBJob(data: IAddReactionJob) {
    this.addJob<IAddReactionJob>(QUEUES.ADD_REACTION_TO_DB, data);
  }

  public removeReactionInDBJob(data: IRemoveReactionJob) {
    this.addJob<IRemoveReactionJob>(QUEUES.REMOVE_REACTION_FROM_DB, data);
  }
}

export const reactionQueue = new ReactionQueue();
