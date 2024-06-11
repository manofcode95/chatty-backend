import { QUEUES } from '@root/shared/constants/keys';
import { BaseQueue } from '@services/queue/base.queue';
import { IBlockedUserJob, IUserJob } from '@user/interfaces/user.interface';
import { userWorker } from '@workers/user.worker';

export class UserQueue extends BaseQueue {
  constructor() {
    super('user');
    this.processJob<IUserJob>(QUEUES.ADD_USER_TO_DB, 5, userWorker.addUserToDb);
    this.processJob<IBlockedUserJob>(QUEUES.UPDATE_BLOCKED_USER_IN_DB, 5, userWorker.addBlockedUserToDb);
  }

  saveUserToDbJob(data: IUserJob) {
    this.addJob<IUserJob>(QUEUES.ADD_USER_TO_DB, data);
  }

  addBlockedUserInDbJob(data: IBlockedUserJob) {
    this.addJob<IBlockedUserJob>(QUEUES.UPDATE_BLOCKED_USER_IN_DB, data);
  }
}

export const userQueue = new UserQueue();
