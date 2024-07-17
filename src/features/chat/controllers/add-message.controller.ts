import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { userCache } from '@services/redis/user.cache';
import { joiValidation } from '@root/shared/globals/decorators/joi-validation.decorator';
import { addChatSchema } from '@chat/schemes/chat.scheme';
import mongoose from 'mongoose';
import { UploadApiResponse } from 'cloudinary';
import { upload } from '@globals/helpers/image-handler';
import { BadRequestError } from '@globals/helpers/error-handler';
import { IMessageData } from '@chat/interfaces/message.interface';
import { socketIOChatObject } from '@sockets/chat.socket';
import { chatQueue } from '@services/queue/chat.queue';

export class AddMessageController {
  @joiValidation(addChatSchema)
  public async addMessage(req: Request, res: Response): Promise<void> {
    const { conversationId, receiverId, body, gifUrl, selectedImage } = req.body;
    let fileUrl = '';
    const messageObjectId = new mongoose.Types.ObjectId();
    const conversationObjectId = !conversationId ? new mongoose.Types.ObjectId() : new mongoose.Types.ObjectId(conversationId as string);

    const sender = await userCache.getUserFromCache(`${req.currentUser!.userId}`);

    if (selectedImage.length) {
      const result: UploadApiResponse = (await upload(req.body.image, req.currentUser!.userId, true, true)) as UploadApiResponse;
      if (!result?.public_id) {
        throw new BadRequestError(result.message);
      }
      fileUrl = `https://res.cloudinary.com/dyamr9ym3/image/upload/v${result.version}/${result.public_id}`;
    }

    const messageData: IMessageData = {
      _id: messageObjectId,
      conversationId: conversationObjectId,
      sender: {
        id: req.currentUser!.userId,
        username: `${req.currentUser!.username}`,
        avatarColor: `${req.currentUser!.avatarColor}`,
        profilePicture: `${sender.profilePicture}`
      },
      receiverId,
      body,
      gifUrl,
      selectedImage: fileUrl,
      reaction: [],
      createdAt: new Date(),
      deleteForMe: false,
      deleteForEveryone: false
    };

    this.emitSocketIOEvent(messageData);

    chatQueue.addChatToDBJob(messageData);

    res.status(HTTP_STATUS.OK).json({ message: 'Message added', conversationId: conversationObjectId });
  }

  // public async addChatUsers(req: Request, res: Response): Promise<void> {
  //   socketIOChatObject.emit('add chat users', chatUsers);
  //   res.status(HTTP_STATUS.OK).json({ message: 'Users added' });
  // }

  // public async removeChatUsers(req: Request, res: Response): Promise<void> {
  //   socketIOChatObject.emit('add chat users', chatUsers);
  //   res.status(HTTP_STATUS.OK).json({ message: 'Users removed' });
  // }

  private emitSocketIOEvent(data: IMessageData): void {
    socketIOChatObject.emit('message received', data);
    socketIOChatObject.emit('chat list', data);
  }

  // private async messageNotification({ currentUser, message, receiverName, receiverId }: IMessageNotification): Promise<void> {
  //   const cachedUser: IUserDocument = (await userCache.getUserFromCache(`${receiverId}`)) as IUserDocument;
  //   if (cachedUser.notifications.messages) {
  //     const templateParams: INotificationTemplate = {
  //       username: receiverName,
  //       message,
  //       header: `Message notification from ${currentUser.username}`
  //     };
  //     const template: string = notificationTemplate.notificationMessageTemplate(templateParams);
  //     emailQueue.addEmailJob('directMessageEmail', {
  //       receiverEmail: cachedUser.email!,
  //       template,
  //       subject: `You've received messages from ${currentUser.username}`
  //     });
  //   }
  // }
}

export const addMessageController = new AddMessageController();
