import { Types, Document } from 'mongoose';

export interface INotification {
  userTo: Types.ObjectId;
  userFrom: Types.ObjectId;
  message: string;
  notificationType: string;
  entityId: Types.ObjectId;
  createdItemId: Types.ObjectId;
  createdAt: Date;
  comment?: string;
  reaction?: string;
  post?: string;
  imgId?: string;
  imgVersion?: string;
  gifUrl?: string;
}

export interface INotificationDocument extends Document, INotification {
  _id?: Types.ObjectId | string;
  read?: boolean;
  insertNotification(data: INotification): Promise<void>;
}

export interface ISendNotificationJobData extends INotificationDocument {}

export interface IUpdateNotificationJobData {
  key?: string;
}

export interface INotificationTemplate {
  username: string;
  message: string;
  header: string;
}
