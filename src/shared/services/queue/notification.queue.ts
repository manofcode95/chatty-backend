import { ICreateCommentNotificationJob } from '@comment/interfaces/comment.interface';
import { ICreateFollowerNotificationJob } from '@follower/interfaces/follower.interface';
import { ICreateReactionNotificationJob } from '@reaction/interfaces/reaction.interface';
import { QUEUES } from '@root/shared/constants/keys';
import { BaseQueue } from '@services/queue/base.queue';
import { notificationWorker } from '@workers/notification.worker';

class NotificationQueue extends BaseQueue {
  constructor() {
    super('notifications');
    // this.processJob('updateNotification', 5, notificationWorker.updateNotification);
    // this.processJob('deleteNotification', 5, notificationWorker.deleteNotification);
    this.processJob<ICreateCommentNotificationJob>(QUEUES.SEND_NOTIFICATION_COMMENT, 5, notificationWorker.sendNotificationForComment);
    this.processJob<ICreateFollowerNotificationJob>(QUEUES.SEND_NOTIFICATION_FOLLOWER, 5, notificationWorker.sendNotificationForFollower);
    this.processJob<ICreateReactionNotificationJob>(QUEUES.SEND_NOTIFICATION_REACTION, 5, notificationWorker.sendNotificationForReaction);
  }

  public sendCommentNotification(data: ICreateCommentNotificationJob) {
    this.addJob<ICreateCommentNotificationJob>(QUEUES.SEND_NOTIFICATION_COMMENT, data);
  }

  public sendFollowerNotification(data: ICreateFollowerNotificationJob) {
    this.addJob<ICreateFollowerNotificationJob>(QUEUES.SEND_NOTIFICATION_FOLLOWER, data);
  }

  public sendReactionNotification(data: ICreateReactionNotificationJob) {
    this.addJob<ICreateReactionNotificationJob>(QUEUES.SEND_NOTIFICATION_REACTION, data);
  }
}

export const notificationQueue: NotificationQueue = new NotificationQueue();
