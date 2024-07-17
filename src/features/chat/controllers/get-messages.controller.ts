import { IMessageDocument } from '@chat/interfaces/message.interface';
import { chatService } from '@services/db/chat.service';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';

export class GetMessagesController {
  public async getConversationList(req: Request, res: Response): Promise<void> {
    let list = await chatService.getUserConversationList(req.currentUser!.userId);

    res.status(HTTP_STATUS.OK).json({ message: 'User conversation list', list });
  }

  public async getMessages(req: Request, res: Response): Promise<void> {
    const { conversationId } = req.params;

    const [messages, lastReadMessage] = await Promise.all([
      chatService.getMessages(conversationId, { createdAt: 1 }),
      chatService.getLastMessage(conversationId, req.currentUser!.userId)
    ]);

    res.status(HTTP_STATUS.OK).json({ message: 'User chat messages', messages, lastReadMessage });
  }
}

export const getMessagesController = new GetMessagesController();
