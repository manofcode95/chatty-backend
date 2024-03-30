import mongoose from 'mongoose';
import JWT from 'jsonwebtoken';
import { config } from '@root/config';
import { IAuthDocument, ISignUpData } from '@auth/interfaces/auth.interface';
import { firstLetterUppercase, lowerCase } from '@root/shared/globals/helpers/utils';

export class AuthUtil {
  public signUpData(data: ISignUpData): IAuthDocument {
    const { _id, username, email, uId, password, avatarColor } = data;
    return {
      _id,
      uId,
      username: firstLetterUppercase(username),
      email: lowerCase(email),
      password,
      avatarColor,
      createdAt: new Date()
    } as IAuthDocument;
  }

  public signToken(authData: IAuthDocument, userObjectId: mongoose.Types.ObjectId | string) {
    return JWT.sign(
      {
        userId: userObjectId,
        uId: authData.uId,
        username: authData.username,
        email: authData.email,
        avatarColor: authData.avatarColor
      },
      config.JWT_TOKEN!
    );
  }
}

export const authUtil = new AuthUtil();
