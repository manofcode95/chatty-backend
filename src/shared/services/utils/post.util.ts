import { IPostDocument } from '@post/interfaces/post.interface';
import { UploadApiResponse } from 'cloudinary';
import { Request } from 'express';
import mongoose from 'mongoose';

export class PostUtil {
  public createPostDocument(req: Request, uploadImageResult?: UploadApiResponse): IPostDocument {
    const { post, bgColor, privacy, gifUrl, profilePicture, feelings } = req.body;
    const postObjectId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId();

    return {
      _id: postObjectId,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      email: req.currentUser!.email,
      avatarColor: req.currentUser!.avatarColor,
      profilePicture,
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      commentsCount: 0,
      imgVersion: uploadImageResult?.version.toString(),
      imgId: uploadImageResult?.public_id,
      videoId: '',
      videoVersion: '',
      createdAt: new Date(),
      reactions: { like: 0, love: 0, happy: 0, sad: 0, wow: 0, angry: 0 }
    } as IPostDocument;
  }
}

export const postUtil = new PostUtil();
