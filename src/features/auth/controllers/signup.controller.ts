import { Request, Response } from 'express';
import { UploadApiResponse } from 'cloudinary';
import { getImageUrl, upload } from '@global/helpers/image-handler';
import HTTP_STATUS from 'http-status-codes';
import { signUpSchema } from '@auth/schemes/signup';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { authService } from '@services/db/auth.service';
import { BadRequestError } from '@global/helpers/error-handler';
import mongoose from 'mongoose';
import { generateRandomIntegers } from '@global/helpers/utils';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { IUserDocument } from '@user/interfaces/user.interface';
import { userCache } from '@services/redis/user.cache';
import { authQueue } from '@services/queue/auth.queue';
import { userQueue } from '@services/queue/user.queue';
import { authUtil } from '@services/utils/auth.util';
import { userUtil } from '@services/utils/user.util';

export class SignupController {
  @joiValidation(signUpSchema)
  public async signUp(req: Request, res: Response): Promise<void> {
    const { username, password, email, avatarColor, avatarImage } = req.body;

    const checkIfUserExist = await authService.getUserByEmailOrUsername(username, email);

    if (checkIfUserExist) {
      throw new BadRequestError('Bad credentials');
    }

    const authObjectId = new mongoose.Types.ObjectId();
    const userObjectId = new mongoose.Types.ObjectId();

    const uId = `${generateRandomIntegers(12)}`;

    const authData: IAuthDocument = authUtil.signUpData({
      _id: authObjectId,
      uId,
      username,
      email,
      password,
      avatarColor
    });

    const imgResult: UploadApiResponse = (await upload(avatarImage, `${userObjectId}`, true, true)) as UploadApiResponse;

    if (!imgResult?.public_id) {
      throw new BadRequestError('File upload: Error occurred. Try again.');
    }

    // Add to redis cache
    const userDataForCache: IUserDocument = userUtil.userData(authData, userObjectId);
    userDataForCache.profilePicture = getImageUrl(imgResult.version, userObjectId);
    await userCache.saveUserToCache(`${userObjectId}`, uId, userDataForCache);

    // Add to database
    authQueue.addAuthUserJob('addAuthUserToDb', { value: authData });
    userQueue.addUserJob('addUserToDb', { value: userDataForCache });

    // Gen token
    const userJwt = authUtil.signToken(authData, userObjectId);
    req.session = { jwt: userJwt };
    req.session.test = 123;
    res.status(HTTP_STATUS.CREATED).json({ message: 'User created successfully', user: userDataForCache, token: userJwt });
  }
}

export const signUpController = new SignupController();
