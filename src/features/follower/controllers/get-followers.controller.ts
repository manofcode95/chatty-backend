import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';
import { followerCache } from '@services/redis/follower.cache';
import { IFollowerData } from '@follower/interfaces/follower.interface';
import { followerService } from '@services/db/follower.service';

export class GetFollowersController {
  public async getFollowers(req: Request, res: Response): Promise<void> {
    const userId = req.params.userId;
    let followers: IFollowerData[];

    try {
      followers = await followerCache.getFollowersFromCache(userId);
    } catch {
      followers = await followerService.getFollowers(new mongoose.Types.ObjectId(userId));
    }

    res.status(HTTP_STATUS.OK).json({ message: 'User followers', followers });
  }
}

export const getFollowersController = new GetFollowersController();
