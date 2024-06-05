import { BaseQueue } from '@services/queue/base.queue';
import { IBlockedUserJobData, IUserJob } from '@user/interfaces/user.interface';
import { userWorker } from '@workers/user.worker';

export class UserQueue extends BaseQueue {
  constructor() {
    super('user');
    this.processJob('addUserToDb', 5, userWorker.addUserToDb);
    this.processJob('addBlockedUserToDb', 5, userWorker.addBlockedUserToDb);
  }

  public addUserJob(name: string, data: IUserJob) {
    this.addJob(name, data);
  }

  public addBlockUserJob(name: string, data: IBlockedUserJobData) {
    this.addJob(name, data);
  }
}

export const userQueue = new UserQueue();
