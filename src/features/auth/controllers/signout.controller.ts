import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

export class SignOutController {
  public signOut(req: Request, res: Response) {
    req.session = null;
    res.status(HTTP_STATUS.OK).json({ message: 'Logout successful', user: {}, token: '' });
  }
}

export const signOutController = new SignOutController();
