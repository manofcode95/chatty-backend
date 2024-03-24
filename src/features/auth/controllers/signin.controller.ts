import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { signInSchema } from '@auth/schemes/signin';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { authService } from '@services/db/auth.service';
import { BadRequestError } from '@global/helpers/error-handler';
import { authUtil } from '@services/utils/auth.util';
import { userService } from '@services/db/user.service';
import { IUserDocument } from '@user/interfaces/user.interface';

export class SignInController {
  @joiValidation(signInSchema)
  public async signIn(req: Request, res: Response) {
    const { username, password } = req.body;

    const authData = await authService.getUserByUsername(username);

    if (!authData) {
      throw new BadRequestError('Bad credentials');
    }

    const passwordMatch = await authData.comparePassword(password);

    if (!passwordMatch) {
      throw new BadRequestError('Bad credentials');
    }

    const user: IUserDocument = (await userService.getUserByAuthId(`${authData._id}`))!;

    const userJwt = authUtil.signToken(authData, user._id);

    res.status(HTTP_STATUS.OK).json({ message: 'User login successfully', user, token: userJwt });
  }
}

export const signInController = new SignInController();
