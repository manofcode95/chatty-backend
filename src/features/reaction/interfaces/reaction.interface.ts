import { IPostDocument } from '@post/interfaces/post.interface';
import { Document, Types } from 'mongoose';

export interface IReactionDocument extends Document {
  _id?: string | Types.ObjectId;
  username: string;
  avataColor: string;
  type: string;
  postId: string;
  profilePicture: string;
  createdAt?: Date;
  userTo?: string | Types.ObjectId;
  comment?: string;
}

export interface IReactions {
  like: number;
  love: number;
  happy: number;
  wow: number;
  sad: number;
  angry: number;
}

export interface IAddReactionJob {
  postId: string;
  username: string;
  previousReaction: string;
  userTo: string;
  userFrom: string;
  type: string;
  reactionObject: IReactionDocument;
}

export interface IRemoveReactionJob {
  postId: string;
  username: string;
  previousReaction: string;
}

export interface IQueryReaction {
  _id?: string | Types.ObjectId;
  postId?: string | Types.ObjectId;
}

export interface IReaction {
  senderName: string;
  type: string;
}

export interface ICreateReactionNotificationJob {
  userFromId: string;
  userToId: string;
  post: IPostDocument;
  reaction: IReactionDocument;
}

export interface INotifyReactionEmailJob {
  userFromId: string;
  userToId: string;
}
