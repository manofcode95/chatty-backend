import { joiValidation } from '@globals/decorators/joi-validation.decorator';
import { IPostDocument } from '@post/interfaces/post.interface';
import { postSchema, postWithImageSchema } from '@post/schemes/post.scheme';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { postCache } from '@services/redis/post.cache';
import { socketIOPostObject } from '@sockets/post.socket';
import { postQueue } from '@services/queue/post.queue';
import { UploadApiResponse } from 'cloudinary';
import { upload } from '@root/shared/globals/helpers/image-handler';
import { BadRequestError } from '@globals/helpers/error-handler';

export class UpdatePostController {
  @joiValidation(postSchema)
  public async updatePost(req: Request, res: Response): Promise<void> {
    await this.handleUpdatePost(req);
    res.status(HTTP_STATUS.OK).json({ message: 'Post updated successfully' });
  }

  @joiValidation(postWithImageSchema)
  public async updatePostWithImage(req: Request, res: Response): Promise<void> {
    const { imgId, imgVersion } = req.body;
    if (imgId && imgVersion) {
      await this.handleUpdatePost(req);
    } else {
      const result: UploadApiResponse = await this.addImageToExistingPost(req);
      if (!result.public_id) {
        throw new BadRequestError(result.message);
      }
    }
    res.status(HTTP_STATUS.OK).json({ message: 'Post with image updated successfully' });
  }

  async handleUpdatePost(req: Request): Promise<void> {
    const { post, bgColor, feelings, privacy, gifUrl, imgVersion, imgId, profilePicture, videoId, videoVersion } = req.body;
    const { postId } = req.params;
    const updatedPost: IPostDocument = {
      post,
      bgColor,
      privacy,
      feelings,
      gifUrl,
      profilePicture,
      imgId: imgId ? imgId : '',
      imgVersion: imgVersion ? imgVersion : '',
      videoId: videoId ? videoId : '',
      videoVersion: videoVersion ? videoVersion : ''
    } as IPostDocument;

    const postUpdated: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);
    socketIOPostObject.emit('update post', postUpdated, 'posts');
    postQueue.updatePostInDBJob({ postId, post: postUpdated });
  }

  async addImageToExistingPost(req: Request): Promise<UploadApiResponse> {
    const { post, bgColor, feelings, privacy, gifUrl, profilePicture, image, video } = req.body;
    const { postId } = req.params;

    const result: UploadApiResponse = (await upload(image)) as UploadApiResponse;

    if (!result?.public_id) {
      return result;
    }
    const updatedPost: IPostDocument = {
      post,
      bgColor,
      privacy,
      feelings,
      gifUrl,
      profilePicture,
      imgId: image ? result.public_id : '',
      imgVersion: image ? result.version.toString() : '',
      videoId: video ? result.public_id : '',
      videoVersion: video ? result.version.toString() : ''
    } as IPostDocument;

    const postUpdated: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);
    socketIOPostObject.emit('update post', postUpdated, 'posts');
    postQueue.updatePostInDBJob({ postId, post: postUpdated });

    // TODO image queue
    // if (image) {
    //   imageQueue.addImageJob('addImageToDB', {
    //     key: `${req.currentUser!.userId}`,
    //     imgId: result.public_id,
    //     imgVersion: result.version.toString()
    //   });
    // }
    return result;
  }
}

export const updatePostController = new UpdatePostController();
