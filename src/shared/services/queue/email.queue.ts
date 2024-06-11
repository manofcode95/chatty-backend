import { ISendFConfirmPasswordEmailJob, ISendForgotPasswordEmailJob } from '@auth/interfaces/auth.interface';
import { INotifyCommentEmailJob } from '@comment/interfaces/comment.interface';
import { INotifyFollowerEmailJob } from '@follower/interfaces/follower.interface';
import { INotifyReactionEmailJob } from '@reaction/interfaces/reaction.interface';
import { QUEUES } from '@root/shared/constants/keys';
import { BaseQueue } from '@services/queue/base.queue';
import { emailWorker } from '@workers/email.worker';

export class EmailQueue extends BaseQueue {
  constructor() {
    super('email');
    this.processJob<ISendForgotPasswordEmailJob>(QUEUES.SEND_FORGOT_PASSWORD_EMAIL, 5, emailWorker.sendRequestPasswordEmail);
    this.processJob<ISendFConfirmPasswordEmailJob>(QUEUES.SEND_RESET_PASSWORD_EMAIL, 5, emailWorker.sendConfirmPasswordEmail);
    this.processJob<INotifyCommentEmailJob>(QUEUES.NOTIFY_COMMENT_EMAIL, 5, emailWorker.notifyComment);
    this.processJob<INotifyFollowerEmailJob>(QUEUES.NOTIFY_FOLLOWER_EMAIL, 5, emailWorker.notifyFollower);
    this.processJob<INotifyReactionEmailJob>(QUEUES.NOTIFY_REACTION_EMAIL, 5, emailWorker.notifiyReaction);
  }

  public sendForgotPasswordEmailJob(data: ISendForgotPasswordEmailJob) {
    this.addJob<ISendForgotPasswordEmailJob>(QUEUES.SEND_FORGOT_PASSWORD_EMAIL, data);
  }

  public sendConfirmPasswordEmailJob(data: ISendFConfirmPasswordEmailJob) {
    this.addJob<ISendFConfirmPasswordEmailJob>(QUEUES.SEND_RESET_PASSWORD_EMAIL, data);
  }

  public notifyCommentByEmailJob(data: INotifyCommentEmailJob) {
    this.addJob<INotifyCommentEmailJob>(QUEUES.NOTIFY_COMMENT_EMAIL, data);
  }

  public notifyFollowerByEmailJob(data: INotifyFollowerEmailJob) {
    this.addJob<INotifyFollowerEmailJob>(QUEUES.NOTIFY_FOLLOWER_EMAIL, data);
  }

  public notifyReactionByEmailJob(data: INotifyReactionEmailJob) {
    this.addJob<INotifyReactionEmailJob>(QUEUES.NOTIFY_REACTION_EMAIL, data);
  }
}

export const emailQueue = new EmailQueue();
