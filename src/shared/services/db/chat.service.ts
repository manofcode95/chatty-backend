import { ILastReadMessageDocument, IMessageData, IMessageDocument } from '@chat/interfaces/message.interface';
import { IConversationDocument } from '@chat/interfaces/conversation.interface';
import { ConversationModel } from '@chat/models/conversation.model';
import { MessageModel } from '@chat/models/message.model';
import mongoose from 'mongoose';
import { LastReadMessageModel } from '@chat/models/lastReadMessage.model';

class ChatService {
  public async addMessageToDB(data: IMessageData): Promise<void> {
    const conversation = await ConversationModel.findOne({ _id: data?.conversationId }).exec();

    if (!conversation) {
      await ConversationModel.create({
        _id: data?.conversationId,
        participants: [data.sender.id, data.receiverId]
      });
    }

    const message = await MessageModel.create({
      _id: data._id,
      conversationId: data.conversationId,
      sender: data.sender,
      body: data.body,
      gifUrl: data.gifUrl,
      selectedImage: data.selectedImage,
      reaction: data.reaction,
      createdAt: data.createdAt
    });

    Promise.all([
      ConversationModel.updateOne(
        { _id: new mongoose.Types.ObjectId(data?.conversationId) },
        {
          $set: {
            lastMessage: {
              id: message.id,
              body: message.body
            }
          }
        }
      ),
      this.updateLastReadMessage(data.conversationId, data.sender.id, message._id)
    ]);
  }

  public async getUserConversationList(userId: string): Promise<IConversationDocument[]> {
    const conversations = await ConversationModel.aggregate([
      { $match: { participants: new mongoose.Types.ObjectId(userId) } },
      { $sort: { createdAt: 1 } }
    ]);

    return conversations;
  }

  public async getMessages(conversationId: string, sort: Record<string, 1 | -1>): Promise<IMessageDocument[]> {
    const messages = await MessageModel.aggregate([
      { $match: { conversationId: new mongoose.Types.ObjectId(conversationId) } },
      { $sort: { createdAt: 1 } },
      { $project: { __v: 0 } }
    ]);

    return messages;
  }

  public async getLastMessage(conversationId: string, userId: string): Promise<ILastReadMessageDocument | null> {
    const message = await LastReadMessageModel.findOne({
      conversationId: new mongoose.Types.ObjectId(conversationId),
      userId: new mongoose.Types.ObjectId(userId)
    }).select('-__v');

    return message;
  }

  // public async markMessageAsDeleted(messageId: string, type: string): Promise<void> {
  //   if (type === 'deleteForMe') {
  //     await MessageModel.updateOne({ _id: messageId }, { $set: { deleteForMe: true } }).exec();
  //   } else {
  //     await MessageModel.updateOne({ _id: messageId }, { $set: { deleteForMe: true, deleteForEveryone: true } }).exec();
  //   }
  // }

  public async updateLastReadMessage(
    conversationId: string | mongoose.Types.ObjectId,
    userId: string,
    messageId: string | mongoose.Types.ObjectId
  ): Promise<void> {
    const filter = {
      conversationId: new mongoose.Types.ObjectId(conversationId),
      userId: new mongoose.Types.ObjectId(userId)
    };

    const update = {
      $set: {
        messageId: new mongoose.Types.ObjectId(messageId),
        createdAt: new Date()
      }
    };

    const options = {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    };

    await LastReadMessageModel.findOneAndUpdate(filter, update, options);
  }

  // public async updateMessageReaction(messageId: ObjectId, senderName: string, reaction: string, type: 'add' | 'remove'): Promise<void> {
  //   if (type === 'add') {
  //     await MessageModel.updateOne({ _id: messageId }, { $push: { reaction: { senderName, type: reaction } } }).exec();
  //   } else {
  //     await MessageModel.updateOne({ _id: messageId }, { $pull: { reaction: { senderName } } }).exec();
  //   }
  // }
}

export const chatService: ChatService = new ChatService();
