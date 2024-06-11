import { FollowerModel } from '@follower/models/follower.model';
import { UserModel } from '@user/models/user.model';
import mongoose, { Query } from 'mongoose';
import { IFollowerData, IFollowerDocument } from '@follower/interfaces/follower.interface';
import { IQueryDeleted, IQueryComplete } from '@post/interfaces/post.interface';
import { emailQueue } from '@services/queue/email.queue';
import { notificationQueue } from '@services/queue/notification.queue';
import { IUserDocument } from '@user/interfaces/user.interface';

class FollowerService {
  public async addFollower(followee: IUserDocument, follower: IUserDocument, followerDocumentId: mongoose.Types.ObjectId): Promise<void> {
    await FollowerModel.create({
      _id: followerDocumentId,
      followeeId: followee._id,
      followerId: follower._id
    });

    const users = UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: followee._id },
          update: { $inc: { followingCount: 1 } }
        }
      },
      {
        updateOne: {
          filter: { _id: follower._id },
          update: { $inc: { followersCount: 1 } }
        }
      }
    ]);

    await Promise.all([users]);

    emailQueue.notifyFollowerByEmailJob({
      followee,
      follower,
      followerObjectId: followerDocumentId
    });

    notificationQueue.sendFollowerNotification({
      followee,
      follower,
      followerObjectId: followerDocumentId
    });
  }

  public async removeFollower(followeeId: string, followerId: string): Promise<void> {
    const followeeObjectId = new mongoose.Types.ObjectId(followeeId);
    const followerObjectId = new mongoose.Types.ObjectId(followerId);

    const unfollow: Query<IQueryComplete & IQueryDeleted, IFollowerDocument> = FollowerModel.deleteOne({
      followeeId: followeeObjectId,
      followerId: followerObjectId
    });

    const users = UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: followeeId },
          update: { $inc: { followingCount: -1 } }
        }
      },
      {
        updateOne: {
          filter: { _id: followerId },
          update: { $inc: { followersCount: -1 } }
        }
      }
    ]);

    await Promise.all([unfollow, users]);
  }

  public async getFollowers(userObjectId: mongoose.Types.ObjectId): Promise<IFollowerData[]> {
    const followee: IFollowerData[] = await FollowerModel.aggregate([
      { $match: { followerId: userObjectId } },
      { $lookup: { from: 'User', localField: 'followeeId', foreignField: '_id', as: 'followeeId' } },
      { $unwind: '$followeeId' },
      { $lookup: { from: 'Auth', localField: 'followeeId.authId', foreignField: '_id', as: 'authId' } },
      { $unwind: '$authId' },
      {
        $addFields: {
          _id: '$followeeId._id',
          username: '$authId.username',
          avatarColor: '$authId.avatarColor',
          uId: '$authId.uId',
          postCount: '$followeeId.postsCount',
          followersCount: '$followeeId.followersCount',
          followingCount: '$followeeId.followingCount',
          profilePicture: '$followeeId.profilePicture',
          userProfile: '$followeeId'
        }
      },
      {
        $project: {
          authId: 0,
          followerId: 0,
          followeeId: 0,
          createdAt: 0,
          __v: 0
        }
      }
    ]);
    return followee;
  }

  public async getFollowings(userObjectId: mongoose.Types.ObjectId): Promise<IFollowerData[]> {
    const test1 = await FollowerModel.aggregate([
      { $match: { followeeId: userObjectId } },
      { $lookup: { from: 'User', localField: 'followerId', foreignField: '_id', as: 'followerId' } }
    ]);

    console.log(test1);

    const test2 = await FollowerModel.aggregate([
      { $match: { followeeId: userObjectId } },
      { $lookup: { from: 'User', localField: 'followerId', foreignField: '_id', as: 'followerId' } },
      { $unwind: '$followerId' }
    ]);

    console.log(test2);

    const test3 = await FollowerModel.aggregate([
      { $match: { followeeId: userObjectId } },
      { $lookup: { from: 'User', localField: 'followerId', foreignField: '_id', as: 'followerId' } },
      { $unwind: '$followerId' },
      { $lookup: { from: 'Auth', localField: 'followerId.authId', foreignField: '_id', as: 'authId' } }
    ]);

    console.log(test3);

    const test4 = await FollowerModel.aggregate([
      { $match: { followeeId: userObjectId } },
      { $lookup: { from: 'User', localField: 'followerId', foreignField: '_id', as: 'followerId' } },
      { $unwind: '$followerId' },
      { $lookup: { from: 'Auth', localField: 'followerId.authId', foreignField: '_id', as: 'authId' } },
      { $unwind: '$authId' }
    ]);

    console.log(test4);

    const follower: IFollowerData[] = await FollowerModel.aggregate([
      { $match: { followeeId: userObjectId } },
      { $lookup: { from: 'User', localField: 'followerId', foreignField: '_id', as: 'followerId' } },
      { $unwind: '$followerId' },
      { $lookup: { from: 'Auth', localField: 'followerId.authId', foreignField: '_id', as: 'authId' } },
      { $unwind: '$authId' },
      {
        $addFields: {
          _id: '$followerId._id',
          username: '$authId.username',
          avatarColor: '$authId.avatarColor',
          uId: '$authId.uId',
          postCount: '$followerId.postsCount',
          followersCount: '$followerId.followersCount',
          followingCount: '$followerId.followingCount',
          profilePicture: '$followerId.profilePicture',
          userProfile: '$followerId'
        }
      },
      {
        $project: {
          authId: 0,
          followerId: 0,
          followeeId: 0,
          createdAt: 0,
          __v: 0
        }
      }
    ]);
    return follower;
  }

  // public async getFolloweesIds(userId: string): Promise<string[]> {
  //   const followee = await FollowerModel.aggregate([
  //     { $match: { followerId: new mongoose.Types.ObjectId(userId) } },
  //     {
  //       $project: {
  //         followeeId: 1,
  //         _id: 0
  //       }
  //     }
  //   ]);
  //   return map(followee, (result) => result.followeeId.toString());
  // }
}

export const followerService: FollowerService = new FollowerService();
