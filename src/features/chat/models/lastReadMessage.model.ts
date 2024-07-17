import mongoose, { Model, model, Schema } from 'mongoose';
import { ILastReadMessageDocument } from '@chat/interfaces/message.interface';

const lastReadMessageSchema: Schema = new Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
  messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const LastReadMessageModel: Model<ILastReadMessageDocument> = model<ILastReadMessageDocument>(
  'LastReadMessage',
  lastReadMessageSchema,
  'LastReadMessage'
);

export { LastReadMessageModel };
