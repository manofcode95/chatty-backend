import { IUserDocument } from '@user/interfaces/user.interface';
import mongoose from 'mongoose';

export interface ICommentDocument extends Document {
  _id?: string | mongoose.Types.ObjectId;
  username: string;
  avatarColor: string;
  postId: string;
  profilePicture: string;
  comment: string;
  createdAt?: Date;
  userTo?: string | mongoose.Types.ObjectId;
}

export interface ISaveCommentJob {
  user: IUserDocument;
  comment: ICommentDocument;
}

export interface ICreateCommentNotificationJob {
  user: IUserDocument;
  comment: ICommentDocument;
}

export interface INotifyCommentEmailJob extends ICreateCommentNotificationJob {}

export interface ICommentNameList {
  count: number;
  names: string[];
}

export interface IQueryComment {
  _id?: string | mongoose.Types.ObjectId;
  postId?: string | mongoose.Types.ObjectId;
}

export interface IQuerySort {
  createdAt?: number;
}
