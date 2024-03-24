import Queue, { Job } from 'bull';
import Logger from 'bunyan';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { config } from '@root/config';
import { IAuthJob } from '@auth/interfaces/auth.interface';
import { IUserJob } from '@user/interfaces/user.interface';

type IBaseJobData = IAuthJob | IUserJob;

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

  protected addJob(name: string, data: IBaseJobData): void {
    this.queue.add(name, data, { attempts: 3, backoff: { type: 'fixed', delay: 5000 } });
  }

  protected processJob(name: string, concurrency: number, callback: Queue.ProcessCallbackFunction<void>): void {
    this.queue.process(name, concurrency, callback);
  }
}
