// import { IChatJobData, IMessageData } from '@chat/interfaces/chat.interface';
import { IMarkMessagesAsReadInDBJob, IMessageData } from '@chat/interfaces/message.interface';
import { QUEUES } from '@root/shared/constants/keys';
import { BaseQueue } from '@services/queue/base.queue';
import { chatWorker } from '@workers/chat.worker';
// import { chatWorker } from '@worker/chat.worker';

class ChatQueue extends BaseQueue {
  constructor() {
    super('chats');
    this.processJob<IMessageData>(QUEUES.ADD_CHAT_TO_DB, 5, chatWorker.addChatToDB);
    // this.processJob(QUEUES.MARK_MESSAGES_AS_READ_IN_DB, 5, chatWorker.markMessageAsDeleted);
    // this.processJob('markMessagesAsReadInDB', 5, chatWorker.markMessagesAsReadInDB);
    // this.processJob('updateMessageReaction', 5, chatWorker.updateMessageReaction);
  }

  public addChatToDBJob(data: IMessageData): void {
    this.addJob<IMessageData>(QUEUES.ADD_CHAT_TO_DB, data);
  }

  public markMessagesAsRead(data: IMarkMessagesAsReadInDBJob): void {
    this.addJob<IMarkMessagesAsReadInDBJob>(QUEUES.MARK_MESSAGES_AS_READ_IN_DB, data);
  }
}

export const chatQueue: ChatQueue = new ChatQueue();
