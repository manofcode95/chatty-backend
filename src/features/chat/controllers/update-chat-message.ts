import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';
import { IMessageData } from '@chat/interfaces/message.interface';
import { chatQueue } from '@services/queue/chat.queue';
import { markChatSchema } from '@chat/schemes/chat.scheme';
import { joiValidation } from '@globals/decorators/joi-validation.decorator';
import { socketIOChatObject } from '@sockets/chat.socket';

export class Update {
  @joiValidation(markChatSchema)
  public async markAsRead(req: Request, res: Response): Promise<void> {
    const { conversationId } = req.body;
    // const updatedMessage: IMessageData = await messageCache.updateChatMessages(`${senderId}`, `${receiverId}`);
    // socketIOChatObject.emit('message read', updatedMessage);
    // socketIOChatObject.emit('chat list', updatedMessage);
    // chatQueue.addChatJob('markMessagesAsReadInDB', {
    //   senderId: new mongoose.Types.ObjectId(senderId),
    //   receiverId: new mongoose.Types.ObjectId(receiverId)
    // });
    res.status(HTTP_STATUS.OK).json({ message: 'Message marked as read' });
  }
}
