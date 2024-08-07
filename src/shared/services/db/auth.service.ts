import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { AuthModel } from '@auth/models/auth.schema';
import { firstLetterUppercase, lowerCase } from '@root/shared/globals/helpers/utils';

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

  public async updatePasswordToken(authId: string, token: string, tokenExpiration: number): Promise<void> {
    await AuthModel.updateOne(
      { _id: authId },
      {
        passwordResetToken: token,
        passwordResetExpires: tokenExpiration
      }
    );
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
