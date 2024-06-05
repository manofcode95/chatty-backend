import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { followerCache } from '@services/redis/follower.cache';
import { userCache } from '@services/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { IFollowerData } from '@follower/interfaces/follower.interface';
import mongoose from 'mongoose';
import { socketIOFollowerObject } from '@sockets/follower.socket';
import { followerQueue } from '@services/queue/follower.queue';
// import { socketIOFollowerObject } from '@socket/follower';
// import { followerQueue } from '@services/queue/follower.queue';

export class FollowController {
  public async follow(req: Request, res: Response): Promise<void> {
    const { followerId } = req.params;

    await followerCache.updateFollowCountInCache(req.currentUser!.userId, followerId, true);

    const cachedFollower: Promise<IUserDocument> = userCache.getUserFromCache(followerId);
    const cachedFollowee: Promise<IUserDocument> = userCache.getUserFromCache(`${req.currentUser!.userId}`);
    const [follower, followee] = await Promise.all([cachedFollower, cachedFollowee]);

    const addFolloweeData: IFollowerData = this.userData(follower);

    socketIOFollowerObject.emit('add follower', addFolloweeData);

    const followerObjectId = new mongoose.Types.ObjectId();

    followerQueue.addFollowerJob('addFollowerToDb', {
      userId: req.currentUser!.userId,
      followerId: followerId,
      username: req.currentUser!.username,
      followerDocumentId: followerObjectId
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Following user now' });
  }

  private userData(user: IUserDocument): IFollowerData {
    return {
      _id: new mongoose.Types.ObjectId(user._id),
      username: user.username!,
      avatarColor: user.avatarColor!,
      postCount: user.postsCount,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      profilePicture: user.profilePicture,
      uId: user.uId!,
      userProfile: user
    };
  }
}

export const followController = new FollowController();