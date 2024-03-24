import { currentUserController } from '@auth/controllers/current-user.controller';
import { Router, Request, Response } from 'express';

export class UserRouter {
  private router: Router;

  constructor() {
    this.router = Router();
  }

  public routes(): Router {
    this.router.get('/current-user', (req: Request, res: Response) => currentUserController.read(req, res));

    return this.router;
  }
}

export const userRouter = new UserRouter();
