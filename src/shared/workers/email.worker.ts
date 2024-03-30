import { config } from '@root/config';
import { mailTransport } from '@services/email/mail.transport';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';

const log: Logger = config.createLogger('emailWorker');

export class EmailWorker {
  sendEmailNotification(job: Job, done: DoneCallback) {
    try {
      const { subject, template, receiverEmail } = job.data;
      mailTransport.sendMail(receiverEmail, subject, template);
      job.progress(100);
      done(null, job.data);
    } catch (err) {
      log.error(err);
      done(err as Error);
    }
  }
}

export const emailWorker = new EmailWorker();
