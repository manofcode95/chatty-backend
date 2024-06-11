import { config } from '@root/config';
import { mailTransport } from '@services/email/mail.transport';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { INotifyCommentEmailJob } from '@comment/interfaces/comment.interface';
import { INotificationTemplate } from '@notification/interfaces/notification.interface';
import { notificationTemplate } from '@services/email/templates/notifications/notification-template';
import { userCache } from '@services/redis/user.cache';
import { ISendFConfirmPasswordEmailJob, ISendForgotPasswordEmailJob } from '@auth/interfaces/auth.interface';
import { forgotPasswordTemplate } from '@services/email/templates/forgot-password/forgot-password.template';
import publicIP from 'ip';
import { resetPasswordTemplate } from '@services/email/templates/reset-password/reset-password.template';
import moment from 'moment';
import { INotifyFollowerEmailJob } from '@follower/interfaces/follower.interface';
import { INotifyReactionEmailJob } from '@reaction/interfaces/reaction.interface';

const log: Logger = config.createLogger('emailWorker');

export class EmailWorker {
  async sendRequestPasswordEmail(job: Job<ISendForgotPasswordEmailJob>, done: DoneCallback) {
    try {
      const { auth, resetLink } = job.data;

      const template: string = forgotPasswordTemplate.getTemplate(auth.username, resetLink);
      const subject = 'Reset your password';
      await mailTransport.sendMail(auth.email, subject, template);
    } catch (err) {
      log.error(err);
      done(err as Error);
    }
  }

  async sendConfirmPasswordEmail(job: Job<ISendFConfirmPasswordEmailJob>, done: DoneCallback) {
    try {
      const { auth } = job.data;

      const templateParams = {
        username: auth.username,
        email: auth.email,
        ipaddress: publicIP.address(),
        date: moment().format('DD//MM//YYYY HH:mm')
      };

      const template: string = resetPasswordTemplate.getTemplate(templateParams);

      const subject = 'Password Reset Confirmation';

      await mailTransport.sendMail(auth.email, subject, template);
    } catch (err) {
      log.error(err);
      done(err as Error);
    }
  }

  async notifyComment(job: Job<INotifyCommentEmailJob>, done: DoneCallback) {
    try {
      const { comment, user: userFrom } = job.data;

      const userTo = await userCache.getUserFromCache(comment.userTo as string);

      if (userTo.notifications.comments && userFrom._id !== userTo._id) {
        const templateParams: INotificationTemplate = {
          username: userTo.username!,
          message: `${userFrom.username} commented on your post.`,
          header: 'Comment Notification'
        };
        const template: string = notificationTemplate.getTemplate(templateParams);
        const subject = 'Post notification';
        await mailTransport.sendMail(userTo.email!, subject, template);
      }
    } catch (err) {
      log.error(err);
      done(err as Error);
    }
  }

  async notifyFollower(job: Job<INotifyFollowerEmailJob>, done: DoneCallback) {
    try {
      const { followee, follower } = job.data;

      if (follower.notifications.follows && followee._id !== follower._id) {
        const templateParams: INotificationTemplate = {
          username: follower.username!,
          message: `${followee.username} is now following you.`,
          header: 'Follower Notification'
        };
        const template: string = notificationTemplate.getTemplate(templateParams);
        const subject = `${followee.username} is now following you.`;

        await mailTransport.sendMail(follower.email!, subject, template);
      }
    } catch (err) {
      log.error(err);
      done(err as Error);
    }
  }

  async notifiyReaction(job: Job<INotifyReactionEmailJob>, done: DoneCallback) {
    const { userToId, userFromId } = job.data;

    try {
      const [userFrom, userTo] = await Promise.all([userCache.getUserFromCache(userFromId), userCache.getUserFromCache(userToId)]);

      if (userTo.notifications.follows && userTo._id !== userFrom._id) {
        const templateParams: INotificationTemplate = {
          username: userTo.username!,
          message: `${userFrom.username} reacted to your post.`,
          header: 'Post Reaction Notification'
        };

        const template: string = notificationTemplate.getTemplate(templateParams);
        const subject = 'Post reaction notification';

        await mailTransport.sendMail(userTo.email!, subject, template);
      }
    } catch (err) {
      log.error(err);
      done(err as Error);
    }
  }
}

export const emailWorker = new EmailWorker();
