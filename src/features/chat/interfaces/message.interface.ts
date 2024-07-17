import mongoose, { Document } from 'mongoose';
import { AuthPayload } from '@auth/interfaces/auth.interface';
import { IReaction } from '@reaction/interfaces/reaction.interface';

export interface IMessageDocument extends Document {
  _id: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  sender: {
    id: mongoose.Types.ObjectId;
    username: string;
    avatarColor: string;
    profilePicture: string;
  };
  body: string;
  gifUrl: string;
  selectedImage: string;
  reaction: IReaction[];
  createdAt: Date;
  deleteForMe: boolean;
  deleteForEveryone: boolean;
}

export interface IMessageData {
  _id: string | mongoose.Types.ObjectId;
  conversationId: string | mongoose.Types.ObjectId;
  sender: {
    id: string;
    username: string;
    avatarColor: string;
    profilePicture: string;
  };
  receiverId: string;
  body: string;
  gifUrl: string;
  selectedImage: string;
  reaction: IReaction[];
  createdAt: Date;
  deleteForMe: boolean;
  deleteForEveryone: boolean;
}

export interface ILastReadMessageDocument extends Document {
  _id: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface IMessageNotification {
  currentUser: AuthPayload;
  message: string;
  receiverName: string;
  receiverId: string;
  messageData: IMessageData;
}

export interface IChatUsers {
  userOne: string;
  userTwo: string;
}

export interface IChatList {
  receiverId: string;
  conversationId: string;
}

export interface ITyping {
  sender: string;
  receiver: string;
}

export interface IChatJobData {
  senderId?: mongoose.Types.ObjectId | string;
  receiverId?: mongoose.Types.ObjectId | string;
  messageId?: mongoose.Types.ObjectId | string;
  senderName?: string;
  reaction?: string;
  type?: string;
}

export interface IMarkMessagesAsReadInDBJob {
  conversationId: string;
  userId: string;
}

export interface ISenderReceiver {
  senderId: string;
  receiverId: string;
  senderName: string;
  receiverName: string;
}
