import { getNotificationsController } from '@notification/controllers/get-notifications';
import { Router, Request, Response } from 'express';
import { updateNotificationController } from '@notification/controllers/update-notification';
import { deleteNotificationController } from '@notification/controllers/delete-notification';

class NotificationRouter {
  private router: Router;

  constructor() {
    this.router = Router();
  }

  public routes(): Router {
    this.router.get('/notifications', (req: Request, res: Response) => getNotificationsController.getNotifications(req, res));
    this.router.put('/notification/:notificationId', (req: Request, res: Response) =>
      updateNotificationController.updateNotification(req, res)
    );
    this.router.delete('/notification/:notificationId', (req: Request, res: Response) =>
      deleteNotificationController.deleteNotification(req, res)
    );

    return this.router;
  }
}

export const notificationRouter = new NotificationRouter();
