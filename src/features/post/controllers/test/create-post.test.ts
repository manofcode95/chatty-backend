import { postQueue } from '@services/queue/post.queue';
import { postCache } from '@services/redis/post.cache';
import { createPostController } from '../create-post.controller';
import { Request, Response } from 'express';
import { newPost, postMockRequest, postMockResponse } from '@mocks/post.mock';
import { authUserPayload } from '@mocks/auth.mock';
import { postUtil } from '@services/utils/post.util';
import { socketIOPostObject } from '@sockets/post.socket';

jest.mock('@services/redis/post.cache');
jest.mock('@services/queue/post.queue');
jest.mock('@services/queue/base.queue');
jest.mock('@sockets/post.socket');

describe('Create Post', () => {
  it('Should return successful message for valid payload', async () => {
    const req: Request = postMockRequest(newPost, authUserPayload);
    const res: Response = postMockResponse();

    const createdPost = jest.spyOn(postUtil, 'createPostDocument');
    const savePostToCache = jest.spyOn(postCache, 'savePostToCache');
    const savePostToDBJob = jest.spyOn(postQueue, 'addPostToDB');

    await createPostController.createPost(req, res);

    expect(socketIOPostObject.emit).toHaveBeenCalled();

    expect(savePostToCache).toHaveBeenCalled();

    expect(savePostToDBJob).toHaveBeenCalled();

    expect(res.json).toHaveBeenCalledWith({
      message: 'Post created successfully',
      post: createdPost.mock.results[0].value
    });
  });
});
