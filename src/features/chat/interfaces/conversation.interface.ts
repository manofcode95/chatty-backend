import mongoose, { Document } from 'mongoose';

export interface IConversationDocument extends Document {
  _id: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
}
