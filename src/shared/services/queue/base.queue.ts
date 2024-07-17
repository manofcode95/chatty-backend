import Queue, { Job } from 'bull';
import Logger from 'bunyan';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { config } from '@root/config';
import { ISaveAuthJob, ISendFConfirmPasswordEmailJob, ISendForgotPasswordEmailJob } from '@auth/interfaces/auth.interface';
import { IBlockedUserJob, IUserJob } from '@user/interfaces/user.interface';
import { IAddPostJob, IDeletePostJob, IUpdatePostJob } from '@post/interfaces/post.interface';
import {
  IAddReactionJob,
  ICreateReactionNotificationJob,
  INotifyReactionEmailJob,
  IRemoveReactionJob
} from '@root/features/reaction/interfaces/reaction.interface';
import { ICreateCommentNotificationJob, INotifyCommentEmailJob, ISaveCommentJob } from '@comment/interfaces/comment.interface';
import { ISendNotificationJobData } from '@notification/interfaces/notification.interface';
import { IAddFollowerJob, INotifyFollowerEmailJob, IRemoveFollowerJob } from '@follower/interfaces/follower.interface';
import { IFileImageJobData } from '@image/interfaces/image.interface';
import { IMarkMessagesAsReadInDBJob, IMessageData } from '@chat/interfaces/message.interface';

export type IBaseJobData =
  | ISaveAuthJob
  | IUserJob
  | IAddPostJob
  | IUpdatePostJob
  | IDeletePostJob
  | IAddReactionJob
  | IRemoveReactionJob
  | ISaveCommentJob
  | IAddFollowerJob
  | IRemoveFollowerJob
  | IBlockedUserJob
  | ICreateCommentNotificationJob
  | ICreateReactionNotificationJob
  | ISendNotificationJobData
  | ISendForgotPasswordEmailJob
  | ISendFConfirmPasswordEmailJob
  | INotifyCommentEmailJob
  | INotifyFollowerEmailJob
  | INotifyReactionEmailJob
  | IFileImageJobData
  | IMessageData
  | IMarkMessagesAsReadInDBJob;

let bullAdapters: BullAdapter[] = [];

const serverAdapter: ExpressAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/queues');
export { serverAdapter };

export abstract class BaseQueue {
  queue: Queue.Queue;
  logger: Logger;

  constructor(queueName: string) {
    this.logger = config.createLogger(`${queueName}Queue`);
    this.queue = new Queue(queueName, `${config.REDIS_HOST}`);
    bullAdapters.push(new BullAdapter(this.queue));
    bullAdapters = [...new Set(bullAdapters)];

    createBullBoard({
      queues: bullAdapters,
      serverAdapter
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.queue.on('completed', (job: Job) => {
      job.remove();
    });

    this.queue.on('global:completed', (jobId: string) => {
      this.logger.info(`Job ${jobId} completed`);
    });

    this.queue.on('global:stalled', (jobId: string) => {
      this.logger.info(`Job ${jobId} stalled`);
    });

    this.queue.on('error', (error: Error) => {
      this.logger.error(`Queue error: ${error.message}`);
    });
  }

  protected addJob<T extends IBaseJobData>(name: string, data: T): void {
    this.queue.add(name, data, { attempts: 3, backoff: { type: 'fixed', delay: 5000 } });
  }

  protected processJob<T extends IBaseJobData>(name: string, concurrency: number, callback: Queue.ProcessCallbackFunction<T>): void {
    this.queue.process(name, concurrency, callback);
  }
}
