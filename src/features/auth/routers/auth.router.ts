import { signInController } from '@auth/controllers/signin.controller';
import { signOutController } from '@auth/controllers/signout.controller';
import { signUpController } from '@auth/controllers/signup.controller';
import { Router, Request, Response } from 'express';

class AuthRouter {
  private router: Router;

  constructor() {
    this.router = Router();
  }

  public routes(): Router {
    this.router.post('/signup', (req: Request, res: Response) => signUpController.signUp(req, res));
    this.router.post('/signin', (req: Request, res: Response) => signInController.signIn(req, res));
    this.router.post('/signout', (req: Request, res: Response) => signOutController.signOut(req, res));

    return this.router;
  }
}

export const authRouter = new AuthRouter();
