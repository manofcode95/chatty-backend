import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { followerCache } from '@services/redis/follower.cache';
import { followerQueue } from '@services/queue/follower.queue';
import { QUEUES } from '@root/shared/constants/keys';

export class UnfollowController {
  public async unfollow(req: Request, res: Response): Promise<void> {
    const { followerId } = req.params;

    await followerCache.updateFollowCountInCache(req.currentUser!.userId, followerId, false);

    followerQueue.removeFollowerInDBJob({
      userId: req.currentUser!.userId,
      followerId
    });

    res.status(HTTP_STATUS.OK).json({ message: 'Unfollowed user now' });
  }
}

export const unfollowController = new UnfollowController();
