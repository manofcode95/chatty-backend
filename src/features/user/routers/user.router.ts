import { Router, Request, Response } from 'express';
import { blockUserController } from '@user/controllers/block-user.controller';
import { currentUserController } from '@user/controllers/current-user.controller';

class UserRouter {
  private router: Router;

  constructor() {
    this.router = Router();
  }

  public routes(): Router {
    this.router.put('/user/block/:blockedId', (req: Request, res: Response) => blockUserController.blockUser(req, res));
    this.router.put('/user/unblock/:blockedId', (req: Request, res: Response) => blockUserController.unblockUser(req, res));
    this.router.get('/current-user', (req: Request, res: Response) => currentUserController.read(req, res));
    return this.router;
  }
}

export const userRouter: UserRouter = new UserRouter();
