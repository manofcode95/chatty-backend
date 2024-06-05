import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';
import { followerCache } from '@services/redis/follower.cache';
import { IFollowerData } from '@follower/interfaces/follower.interface';
import { followerService } from '@services/db/follower.service';

export class GetFollowingsControllers {
  public async getFollowings(req: Request, res: Response): Promise<void> {
    const userId = req.currentUser!.userId;
    let followings: IFollowerData[] = [];

    try {
      followings = await followerCache.getFollowingsFromCache(userId);
    } catch {
      followings = await followerService.getFollowings(new mongoose.Types.ObjectId(userId));
    }

    res.status(HTTP_STATUS.OK).json({ message: 'User following', followings });
  }
}

export const getFollowingsController = new GetFollowingsControllers();
