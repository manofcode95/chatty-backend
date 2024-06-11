import { notificationService } from '@services/db/notification.service';
import { socketIONotificationObject } from '@sockets/notification.socket';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

class DeleteNotificationController {
  public async deleteNotification(req: Request, res: Response): Promise<void> {
    const { notificationId } = req.params;
    socketIONotificationObject.emit('delete notification', notificationId);
    await notificationService.deleteNotification(notificationId);
    res.status(HTTP_STATUS.OK).json({ message: 'Notification deleted successfully' });
  }
}

export const deleteNotificationController = new DeleteNotificationController();
