import { Request, Response } from 'express';
import { reactionMockRequest, reactionMockResponse } from '@root/mocks/reactions.mock';
import { authUserPayload } from '@root/mocks/auth.mock';
import { reactionCache } from '@services/redis/reaction.cache';
import { reactionQueue } from '@services/queue/reaction.queue';
import { removeReactionController } from '@reaction/controllers/remove-reaction.controller';
import { postCache } from '@services/redis/post.cache';

jest.useFakeTimers();
jest.mock('@services/queue/base.queue');
jest.mock('@services/redis/reaction.cache');
jest.mock('@services/redis/post.cache');

describe('Remove', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should send correct json response', async () => {
    const type = 'like';
    const req: Request = reactionMockRequest({}, {}, authUserPayload, {
      postId: '6027f77087c9d9ccb1555268',
      type
    }) as Request;

    const res: Response = reactionMockResponse();

    const postReactions = {
      like: 1,
      love: 0,
      happy: 0,
      wow: 0,
      sad: 0,
      angry: 0
    };

    jest.spyOn(postCache, 'getPostReaction').mockResolvedValue(postReactions);
    jest.spyOn(reactionCache, 'removePostReactionFromCache');
    const spy = jest.spyOn(reactionQueue, 'addReactionJob');

    await removeReactionController.removeReaction(req, res);
    expect(reactionCache.removePostReactionFromCache).toHaveBeenCalledWith('6027f77087c9d9ccb1555268', `${req.currentUser?.username}`, {
      ...postReactions,
      [type]: postReactions[type] - 1
    });
    expect(reactionQueue.addReactionJob).toHaveBeenCalledWith(spy.mock.calls[0][0], spy.mock.calls[0][1]);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Reaction removed from post'
    });
  });
});
