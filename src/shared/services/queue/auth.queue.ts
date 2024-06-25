import { ISaveAuthJob } from '@auth/interfaces/auth.interface';
import { QUEUES } from '@root/shared/constants/keys';
import { BaseQueue } from '@services/queue/base.queue';
import { authWorker } from '@workers/auth.worker';

export class AuthQueue extends BaseQueue {
  constructor() {
    super('auth');
    this.processJob<ISaveAuthJob>(QUEUES.ADD_AUTH_TO_DB, 5, authWorker.addAuthUserToDB);
  }

  public saveAuthToDBJob(data: ISaveAuthJob) {
    this.addJob<ISaveAuthJob>(QUEUES.ADD_AUTH_TO_DB, data);
  }
}

export const authQueue = new AuthQueue();
