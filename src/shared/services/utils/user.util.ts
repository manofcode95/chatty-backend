import mongoose from 'mongoose';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { firstLetterUppercase } from '@root/shared/globals/helpers/utils';
import { IUserDocument } from '@user/interfaces/user.interface';

export class UserUtil {
  public userData(authData: IAuthDocument, userObjectId: mongoose.Types.ObjectId): IUserDocument {
    const { _id, username, email, uId, password, avatarColor } = authData;
    return {
      _id: userObjectId,
      authId: _id,
      uId,
      username: firstLetterUppercase(username),
      email,
      password,
      avatarColor,
      profilePicture: '',
      blocked: [],
      blockedBy: [],
      work: '',
      location: '',
      school: '',
      quote: '',
      bgImageVersion: '',
      bgImageId: '',
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      notifications: {
        messages: true,
        reactions: true,
        comments: true,
        follows: true
      },
      social: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: ''
      }
    } as unknown as IUserDocument;
  }
}

export const userUtil = new UserUtil();
