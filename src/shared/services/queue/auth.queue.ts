import { IAuthJob } from '@auth/interfaces/auth.interface';
import { BaseQueue } from '@services/queue/base.queue';
import { authWorker } from '@workers/auth.worker';

export class AuthQueue extends BaseQueue {
  constructor() {
    super('auth');
    this.processJob('addAuthUserToDb', 5, authWorker.addAuthUserToDb);
  }

  public addAuthUserJob(name: string, data: IAuthJob) {
    this.addJob(name, data);
  }
}

export const authQueue = new AuthQueue();
