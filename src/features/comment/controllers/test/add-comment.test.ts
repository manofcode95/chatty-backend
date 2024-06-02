import { Request, Response } from 'express';
import { authUserPayload } from '@root/mocks/auth.mock';
import { reactionMockRequest, reactionMockResponse } from '@root/mocks/reactions.mock';
import { commentQueue } from '@services/queue/comment.queue';
import { addCommentController } from '@comment/controllers/add-comment.controller';
import { existingUser } from '@root/mocks/user.mock';
import { commentCache } from '@services/redis/comment.cache';

jest.useFakeTimers();
jest.mock('@services/queue/base.queue');
jest.mock('@services/queue/comment.queue');
jest.mock('@services/redis/comment.cache');

describe('Add', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should call savePostCommentToCache and addCommentJob methods', async () => {
    const req: Request = reactionMockRequest(
      {},
      {
        postId: '6027f77087c9d9ccb1555268',
        comment: 'This is a comment',
        profilePicture: 'https://place-hold.it/500x500',
        userTo: `${existingUser._id}`
      },
      authUserPayload
    ) as Request;
    const res: Response = reactionMockResponse();
    jest.spyOn(commentCache, 'savePostCommentToCache');
    jest.spyOn(commentQueue, 'addCommentJob');

    await addCommentController.addComment(req, res);
    expect(commentCache.savePostCommentToCache).toHaveBeenCalled();
    expect(commentQueue.addCommentJob).toHaveBeenCalled();
  });

  it('should send correct json response', async () => {
    const req: Request = reactionMockRequest(
      {},
      {
        postId: '6027f77087c9d9ccb1555268',
        comment: 'This is a comment',
        profilePicture: 'https://place-hold.it/500x500',
        userTo: `${existingUser._id}`
      },
      authUserPayload
    ) as Request;
    const res: Response = reactionMockResponse();

    await addCommentController.addComment(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Comment created successfully'
    });
  });
});
