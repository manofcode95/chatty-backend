import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { userCache } from '@services/redis/user.cache';
import { userQueue } from '@services/queue/user.queue';

class BlockUserController {
  public async blockUser(req: Request, res: Response): Promise<void> {
    const { blockedId } = req.params;

    await userCache.handleBlockUserInCache(req.currentUser!.userId, blockedId, 'block');

    userQueue.addBlockedUserInDbJob({
      userId: `${req.currentUser!.userId}`,
      blockedId: blockedId,
      type: 'block'
    });

    res.status(HTTP_STATUS.OK).json({ message: 'User blocked' });
  }

  public async unblockUser(req: Request, res: Response): Promise<void> {
    const { blockedId } = req.params;

    await userCache.handleBlockUserInCache(req.currentUser!.userId, blockedId, 'unblock');

    userQueue.addBlockedUserInDbJob({
      userId: `${req.currentUser!.userId}`,
      blockedId: blockedId,
      type: 'unblock'
    });

    res.status(HTTP_STATUS.OK).json({ message: 'User unblocked' });
  }
}

export const blockUserController = new BlockUserController();
