import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { AuthModel } from '@auth/models/auth.model';
import { config } from '@root/config';
import { firstLetterUppercase, lowerCase } from '@root/shared/globals/helpers/utils';
import { emailQueue } from '@services/queue/email.queue';

class AuthService {
  public async createAuthUser(data: IAuthDocument): Promise<void> {
    await AuthModel.create(data);
  }

  public async getUserByEmailOrUsername(username: string, email: string): Promise<IAuthDocument | null> {
    const query = {
      $or: [{ username: firstLetterUppercase(username) }, { email: lowerCase(email) }]
    };

    const user: IAuthDocument | null = await AuthModel.findOne(query).exec();

    return user;
  }

  public async getAuthByUsername(username: string): Promise<IAuthDocument | null> {
    const user: IAuthDocument | null = await AuthModel.findOne({ username: firstLetterUppercase(username) }).exec();

    return user;
  }

  public async getAuthUserByEmail(email: string): Promise<IAuthDocument | null> {
    const user: IAuthDocument | null = await AuthModel.findOne({ email: lowerCase(email) }).exec();
    return user;
  }

  public async updatePasswordToken(auth: IAuthDocument, token: string, tokenExpiration: number): Promise<void> {
    await AuthModel.updateOne(
      { _id: auth._id },
      {
        passwordResetToken: token,
        passwordResetExpires: tokenExpiration
      }
    );

    const resetLink = `${config.CLIENT_URL}/reset-password?token=${token}`;

    emailQueue.sendForgotPasswordEmailJob({ auth, resetLink });
  }

  public async getAuthUserByPasswordToken(token: string): Promise<IAuthDocument | null> {
    const user: IAuthDocument | null = await AuthModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    }).exec();
    return user;
  }
}

export const authService: AuthService = new AuthService();
