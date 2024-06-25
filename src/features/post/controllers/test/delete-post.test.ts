import { Request, Response } from 'express';
// import { Server } from 'socket.io';
import { authUserPayload } from '@root/mocks/auth.mock';
import { socketIOPostObject } from '@sockets/post.socket';
import { newPost, postMockRequest, postMockResponse } from '@root/mocks/post.mock';
import { postQueue } from '@services/queue/post.queue';
import { deletePostController } from '@post/controllers/delete-post.controller';
import { postCache } from '@services/redis/post.cache';

jest.useFakeTimers();
jest.mock('@services/queue/base.queue');
jest.mock('@services/redis/post.cache');
jest.mock('@sockets/post.socket');

describe('Delete', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should send correct json response', async () => {
    const req: Request = postMockRequest(newPost, authUserPayload, { postId: '12345' }) as Request;
    const res: Response = postMockResponse();
    jest.spyOn(postCache, 'deletePostFromCache');
    jest.spyOn(postQueue, 'deletePostFromDB');

    await deletePostController.deletePost(req, res);
    expect(socketIOPostObject.emit).toHaveBeenCalledWith('delete post', req.params.postId);
    expect(postCache.deletePostFromCache).toHaveBeenCalledWith(req.params.postId, `${req.currentUser?.userId}`);
    expect(postQueue.deletePostFromDB).toHaveBeenCalledWith('deletePostFromDB', {
      keyOne: req.params.postId,
      keyTwo: req.currentUser?.userId
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Post deleted successfully'
    });
  });
});
