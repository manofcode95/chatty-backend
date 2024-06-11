import { joiValidation } from '@globals/decorators/joi-validation.decorator';
import { IPostDocument } from '@post/interfaces/post.interface';
import { postSchema, postWithImageSchema } from '@post/schemes/post.scheme';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { postUtil } from '@services/utils/post.util';
import { postCache } from '@services/redis/post.cache';
import { socketIOPostObject } from '@sockets/post.socket';
import { postQueue } from '@services/queue/post.queue';
import { UploadApiResponse } from 'cloudinary';
import { upload } from '@root/shared/globals/helpers/image-handler';
import { BadRequestError } from '@globals/helpers/error-handler';

export class CreatePostController {
  @joiValidation(postSchema)
  public async createPost(req: Request, res: Response): Promise<void> {
    const createdPost: IPostDocument = postUtil.createPostDocument(req);

    await postCache.savePostToCache({
      createdPost,
      key: `${createdPost._id}`,
      currentUserId: req.currentUser!.userId,
      uId: req.currentUser!.uId
    });

    socketIOPostObject.emit('add post', createdPost);

    postQueue.savePostToDbJob({
      userId: req.currentUser!.userId,
      post: createdPost
    });

    res.status(HTTP_STATUS.CREATED).json({ message: 'Post created successfully', post: createdPost });
  }

  @joiValidation(postWithImageSchema)
  public async createPostWithImage(req: Request, res: Response): Promise<void> {
    const { image } = req.body;

    const uploadResult: UploadApiResponse = (await upload(image)) as UploadApiResponse;
    if (!uploadResult?.public_id) {
      throw new BadRequestError(uploadResult.message);
    }

    const createdPost: IPostDocument = postUtil.createPostDocument(req, uploadResult);

    await postCache.savePostToCache({
      createdPost,
      key: `${createdPost._id}`,
      currentUserId: req.currentUser!.userId,
      uId: req.currentUser!.uId
    });

    socketIOPostObject.emit('add post', createdPost);

    postQueue.savePostToDbJob({
      userId: req.currentUser!.userId,
      post: createdPost
    });

    res.status(HTTP_STATUS.CREATED).json({ message: 'Post created successfully', post: createdPost });
  }
}

export const createPostController = new CreatePostController();
