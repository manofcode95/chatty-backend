/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { authUserPayload } from '@root/mocks/auth.mock';
import { postMockData, postMockRequest, postMockResponse, updatedPost, updatedPostWithImage } from '@root/mocks/post.mock';
import { postQueue } from '@services/queue/post.queue';
import { postCache } from '@services/redis/post.cache';
import { updatePostController } from '@post/controllers/update-post.controller';
import * as imageHandler from '@root/shared/globals/helpers/image-handler';
import { socketIOPostObject } from '@sockets/post.socket';

jest.useFakeTimers();
jest.mock('@services/queue/base.queue');
jest.mock('@services/redis/post.cache');
jest.mock('@sockets/post.socket');
jest.mock('@root/shared/globals/helpers/image-handler'); // Automatically uses the mock in __mocks__

describe('Update', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('posts', () => {
    it('should send correct json response', async () => {
      const req: Request = postMockRequest(updatedPost, authUserPayload, { postId: `${postMockData._id}` }) as Request;
      const res: Response = postMockResponse();
      const postSpy = jest.spyOn(postCache, 'updatePostInCache').mockResolvedValue(postMockData);
      jest.spyOn(socketIOPostObject, 'emit');
      jest.spyOn(postQueue, 'updatePostInDB');

      await updatePostController.updatePost(req, res);
      expect(postSpy).toHaveBeenCalledWith(`${postMockData._id}`, updatedPost);
      expect(socketIOPostObject.emit).toHaveBeenCalledWith('update post', postMockData, 'posts');
      expect(postQueue.updatePostInDB).toHaveBeenCalledWith('updatePostInDB', { key: `${postMockData._id}`, value: postMockData });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post updated successfully'
      });
    });
  });

  describe('postWithImage', () => {
    it('should send correct json response if imgId and imgVersion exists', async () => {
      updatedPostWithImage.imgId = '1234';
      updatedPostWithImage.imgVersion = '1234';
      updatedPost.imgId = '1234';
      updatedPost.imgVersion = '1234';
      updatedPost.post = updatedPostWithImage.post;
      updatedPostWithImage.image = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==';
      const req: Request = postMockRequest(updatedPostWithImage, authUserPayload, { postId: `${postMockData._id}` }) as Request;
      const res: Response = postMockResponse();
      const postSpy = jest.spyOn(postCache, 'updatePostInCache').mockImplementationOnce(() => Promise.resolve(postMockData));
      jest.spyOn(socketIOPostObject, 'emit');
      jest.spyOn(postQueue, 'updatePostInDB');

      await updatePostController.updatePostWithImage(req, res);
      expect(postCache.updatePostInCache).toHaveBeenCalledWith(`${postMockData._id}`, postSpy.mock.calls[0][1]);
      expect(socketIOPostObject.emit).toHaveBeenCalledWith('update post', postMockData, 'posts');
      expect(postQueue.updatePostInDB).toHaveBeenCalledWith('updatePostInDB', { key: `${postMockData._id}`, value: postMockData });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post with image updated successfully'
      });
    });

    it('should send correct json response if no imgId and imgVersion', async () => {
      updatedPostWithImage.imgId = '1234';
      updatedPostWithImage.imgVersion = '1234';
      updatedPost.imgId = '1234';
      updatedPost.imgVersion = '1234';
      updatedPost.post = updatedPostWithImage.post;
      updatedPostWithImage.image = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==';
      const req: Request = postMockRequest(updatedPostWithImage, authUserPayload, { postId: `${postMockData._id}` }) as Request;
      const res: Response = postMockResponse();
      const postSpy = jest.spyOn(postCache, 'updatePostInCache').mockImplementationOnce(() => Promise.resolve(postMockData));
      jest.spyOn(imageHandler, 'upload').mockImplementation((): any => Promise.resolve({ version: '1234', public_id: '123456' }));
      jest.spyOn(socketIOPostObject, 'emit');
      jest.spyOn(postQueue, 'updatePostInDB');

      await updatePostController.updatePostWithImage(req, res);
      expect(postCache.updatePostInCache).toHaveBeenCalledWith(`${postMockData._id}`, postSpy.mock.calls[0][1]);
      expect(socketIOPostObject.emit).toHaveBeenCalledWith('update post', postMockData, 'posts');
      expect(postQueue.updatePostInDB).toHaveBeenCalledWith('updatePostInDB', { key: `${postMockData._id}`, value: postMockData });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post with image updated successfully'
      });
    });
  });
});
