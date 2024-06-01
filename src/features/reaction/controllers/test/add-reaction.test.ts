import { Request, Response } from 'express';
import { authUserPayload } from '@root/mocks/auth.mock';
import { reactionCache } from '@services/redis/reaction.cache';
import { reactionQueue } from '@services/queue/reaction.queue';
import { addReactionController } from '@reaction/controllers/add-reaction.controller';
import { reactionMockRequest, reactionMockResponse } from '@mocks/reactions.mock';
import { postCache } from '@services/redis/post.cache';

jest.useFakeTimers();
jest.mock('@services/queue/base.queue');
jest.mock('@services/redis/reaction.cache');
jest.mock('@services/redis/post.cache');

describe('AddReaction', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should send correct json response', async () => {
    const req: Request = reactionMockRequest(
      {},
      {
        postId: '6027f77087c9d9ccb1555268',
        previousReaction: 'love',
        profilePicture: 'http://place-hold.it/500x500',
        userTo: '60263f14648fed5246e322d9',
        type: 'like'
      },
      authUserPayload
    ) as Request;
    const res: Response = reactionMockResponse();

    jest.spyOn(postCache, 'getPostReaction').mockResolvedValue({
      like: 1,
      love: 0,
      happy: 0,
      wow: 0,
      sad: 0,
      angry: 0
    });

    const spy = jest.spyOn(reactionCache, 'savePostReactionToCache');
    const reactionSpy = jest.spyOn(reactionQueue, 'addReactionJob');

    await addReactionController.addReaction(req, res);
    expect(reactionCache.savePostReactionToCache).toHaveBeenCalledWith(
      spy.mock.calls[0][0],
      spy.mock.calls[0][1],
      spy.mock.calls[0][2],
      spy.mock.calls[0][3],
      spy.mock.calls[0][4]
    );
    expect(reactionQueue.addReactionJob).toHaveBeenCalledWith(reactionSpy.mock.calls[0][0], reactionSpy.mock.calls[0][1]);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Reaction added successfully'
    });
  });
});
