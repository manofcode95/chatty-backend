import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { config } from '@root/config';
import { notificationService } from '@services/db/notification.service';
import { userCache } from '@services/redis/user.cache';
import mongoose from 'mongoose';
import { socketIONotificationObject } from '@sockets/notification.socket';
import { postCache } from '@services/redis/post.cache';
import { ICreateFollowerNotificationJob } from '@follower/interfaces/follower.interface';
import { ICreateCommentNotificationJob } from '@comment/interfaces/comment.interface';
import { ICreateReactionNotificationJob } from '@reaction/interfaces/reaction.interface';

const log: Logger = config.createLogger('followerWorker');

class NotificationWorker {
  async sendNotificationForComment(job: Job<ICreateCommentNotificationJob>, done: DoneCallback): Promise<void> {
    try {
      const { user: userFrom, comment } = job.data;

      const [userTo, post] = await Promise.all([
        userCache.getUserFromCache(comment.userTo as string),
        postCache.getPostFromCache(comment.postId)
      ]);

      if (userTo.notifications.comments && userFrom._id !== userTo._id) {
        await notificationService.saveNotification({
          userFrom: new mongoose.Types.ObjectId(userFrom._id),
          userTo: new mongoose.Types.ObjectId(userTo._id),
          message: `${userFrom.username} commented on your post.`,
          notificationType: 'comment',
          entityId: new mongoose.Types.ObjectId(comment._id),
          createdItemId: new mongoose.Types.ObjectId(comment.postId),
          createdAt: new Date(),
          comment: comment.comment,
          post: post.post,
          imgId: post.imgId || '',
          imgVersion: post.imgVersion || '',
          gifUrl: post.gifUrl || '',
          reaction: ''
        });

        const notifications = await notificationService.getNotifications(`${userTo._id}`);
        socketIONotificationObject.emit('insert notification', notifications, { userTo: `${userTo._id}` });
      }

      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async sendNotificationForFollower(job: Job<ICreateFollowerNotificationJob>, done: DoneCallback): Promise<void> {
    try {
      const { followee, follower, followerObjectId } = job.data;

      if (follower.notifications.follows && followee._id !== follower._id) {
        await notificationService.saveNotification({
          userFrom: new mongoose.Types.ObjectId(followee._id),
          userTo: new mongoose.Types.ObjectId(follower._id),
          message: `${followee.username} is now following you.`,
          notificationType: 'follows',
          entityId: new mongoose.Types.ObjectId(followee._id),
          createdItemId: new mongoose.Types.ObjectId(followerObjectId),
          createdAt: new Date(),
          comment: '',
          post: '',
          imgId: '',
          imgVersion: '',
          gifUrl: '',
          reaction: ''
        });

        const notifications = await notificationService.getNotifications(`${follower._id}`);

        socketIONotificationObject.emit('insert notification', notifications, { userTo: `${follower._id}` });
      }

      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async sendNotificationForReaction(job: Job<ICreateReactionNotificationJob>, done: DoneCallback) {
    const { reaction, post, userToId, userFromId } = job.data;

    try {
      const [userFrom, userTo] = await Promise.all([userCache.getUserFromCache(userFromId), userCache.getUserFromCache(userToId)]);

      if (userTo.notifications.reactions && userToId !== userFromId) {
        await notificationService.saveNotification({
          userFrom: new mongoose.Types.ObjectId(userFrom._id),
          userTo: new mongoose.Types.ObjectId(userFrom._id),
          message: `${userFrom.username} reacted to your post.`,
          notificationType: 'reactions',
          entityId: new mongoose.Types.ObjectId(post._id),
          createdItemId: new mongoose.Types.ObjectId(reaction._id!),
          createdAt: new Date(),
          comment: '',
          post: post.post,
          imgId: post.imgId || '',
          imgVersion: post.imgVersion || '',
          gifUrl: post.gifUrl || '',
          reaction: reaction.type
        });

        const notifications = notificationService.getNotifications(`${userTo._id}`);
        socketIONotificationObject.emit('insert notification', notifications, { userTo: `${userTo._id}` });
      }

      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const notificationWorker: NotificationWorker = new NotificationWorker();
