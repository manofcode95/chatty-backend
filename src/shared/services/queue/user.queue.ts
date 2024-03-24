import { BaseQueue } from '@services/queue/base.queue';
import { IUserJob } from '@user/interfaces/user.interface';
import { userWorker } from '@workers/user.worker';

export class UserQueue extends BaseQueue {
  constructor() {
    super('user');
    this.processJob('addUserToDb', 5, userWorker.addUserToDb);
  }

  public addUserJob(name: string, data: IUserJob) {
    this.addJob(name, data);
  }
}

export const userQueue = new UserQueue();
