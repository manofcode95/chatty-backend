import { AuthPayload } from '@auth/interfaces/auth.interface';
import { userService } from '@services/db/user.service';
import { userCache } from '@services/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

export class CurrentUserController {
  public async read(req: Request, res: Response) {
    let isUser = false;
    let token = null;
    let user = null;
    const userPayload: AuthPayload = req?.currentUser as AuthPayload;
    const cachedUser = await userCache.getUserFromCache(userPayload.userId);

    const existingUser: IUserDocument | null = cachedUser || (await userService.getUserById(userPayload.userId));

    if (!existingUser || Object.keys(existingUser).length) {
      isUser = true;
      token = req.session?.jwt;
      user = existingUser;
    }

    res.status(HTTP_STATUS.OK).json({ token, isUser, user });
  }
}

export const currentUserController = new CurrentUserController();
