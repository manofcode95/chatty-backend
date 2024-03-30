import { BaseQueue } from '@services/queue/base.queue';
import { IEmailJob } from '@user/interfaces/user.interface';
import { emailWorker } from '@workers/email.worker';

export class EmailQueue extends BaseQueue {
  constructor() {
    super('email');
    this.processJob('sendForgotPasswordEmail', 5, emailWorker.sendEmailNotification);
    this.processJob('sendResetPasswordEmail', 5, emailWorker.sendEmailNotification);
  }

  public addEmailJob(name: string, data: IEmailJob) {
    this.addJob(name, data);
  }
}

export const emailQueue = new EmailQueue();
