import { IAddFollowerJob, IRemoveFollowerJob } from '@follower/interfaces/follower.interface';
import { QUEUES } from '@root/shared/constants/keys';
import { BaseQueue } from '@services/queue/base.queue';
import { followerWorker } from '@workers/follower.worker';

class FollowerQueue extends BaseQueue {
  constructor() {
    super('followers');
    this.processJob<IAddFollowerJob>(QUEUES.ADD_FOLLOWER_TO_DB, 5, followerWorker.addFollowerToDb);
    this.processJob<IRemoveFollowerJob>(QUEUES.REMOVE_FOLLOWER_FROM_DB, 5, followerWorker.removeFollowerFromDb);
  }

  addFollowerToDbJob(data: IAddFollowerJob) {
    this.addJob<IAddFollowerJob>(QUEUES.ADD_FOLLOWER_TO_DB, data);
  }

  removeFollowerInDbJob(data: IRemoveFollowerJob) {
    this.addJob<IRemoveFollowerJob>(QUEUES.REMOVE_FOLLOWER_FROM_DB, data);
  }
}

export const followerQueue: FollowerQueue = new FollowerQueue();
