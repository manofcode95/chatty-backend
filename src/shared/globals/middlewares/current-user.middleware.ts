import JWT from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { AuthPayload } from '@auth/interfaces/auth.interface';
import { config } from '@root/config';
import { NotAuthorizedError } from '@globals/helpers/error-handler';

class CurrentUserMiddleware {
  public getCurrentUser(req: Request, res: Response, next: NextFunction) {
    const userJwt = req.session?.jwt;

    if (!userJwt) {
      return next();
    }

    try {
      const payload: AuthPayload = JWT.verify(userJwt, config.JWT_TOKEN!) as AuthPayload;
      req.currentUser = payload;
    } finally {
      next();
    }
  }

  public checkAuthentication(req: Request, res: Response, next: NextFunction) {
    if (req.currentUser) return next();

    throw new NotAuthorizedError('Authentication is required to access this route.');
  }
}

export const currentUserMiddleware = new CurrentUserMiddleware();
