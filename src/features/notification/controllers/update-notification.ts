import { notificationService } from '@services/db/notification.service';
import { socketIONotificationObject } from '@sockets/notification.socket';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

class UpdateNotificationController {
  public async updateNotification(req: Request, res: Response): Promise<void> {
    const { notificationId } = req.params;
    socketIONotificationObject.emit('update notification', notificationId);
    await notificationService.updateNotification(notificationId);
    res.status(HTTP_STATUS.OK).json({ message: 'Notification marked as read' });
  }
}

export const updateNotificationController = new UpdateNotificationController();
