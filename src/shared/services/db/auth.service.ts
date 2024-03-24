import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { AuthModel } from '@auth/models/auth.schema';
import { firstLetterUppercase, lowerCase } from '@global/helpers/utils';

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

  public async getUserByUsername(username: string): Promise<IAuthDocument | null> {
    const user: IAuthDocument | null = await AuthModel.findOne({ username: firstLetterUppercase(username) }).exec();

    return user;
  }
}

export const authService: AuthService = new AuthService();
