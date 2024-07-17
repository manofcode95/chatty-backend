import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { config } from '@root/config';
import { IMessageData } from '@chat/interfaces/message.interface';
import { chatService } from '@services/db/chat.service';

const log: Logger = config.createLogger('chatWorker');

class ChatWorker {
  async addChatToDB(job: Job<IMessageData>, done: DoneCallback): Promise<void> {
    try {
      await chatService.addMessageToDB(job.data);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const chatWorker: ChatWorker = new ChatWorker();
