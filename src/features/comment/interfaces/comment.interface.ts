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

export interface ICommentJob {
  postId: string;
  userTo: string;
  userFrom: string;
  username: string;
  comment: ICommentDocument;
}

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
