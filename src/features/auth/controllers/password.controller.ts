import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { emailSchema, passwordSchema } from '@auth/schemes/password.scheme';
import crypto from 'crypto';
import { BadRequestError } from '@globals/helpers/error-handler';
import { joiValidation } from '@root/shared/globals/decorators/joi-validation.decorator';
import { authService } from '@services/db/auth.service';
import { emailQueue } from '@services/queue/email.queue';

export class PasswordController {
  @joiValidation(emailSchema)
  public async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    const auth: IAuthDocument | null = await authService.getAuthUserByEmail(email);
    if (!auth) {
      throw new BadRequestError('Invalid credentials');
    }

    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacters: string = randomBytes.toString('hex');
    await authService.updatePasswordToken(auth, randomCharacters, Date.now() * 60 * 60 * 1000);

    res.status(HTTP_STATUS.OK).json({ message: 'Password reset email sent.' });
  }

  @joiValidation(passwordSchema)
  public async updatePassword(req: Request, res: Response): Promise<void> {
    const { password, confirmPassword } = req.body;
    const { token } = req.params;
    if (password !== confirmPassword) {
      throw new BadRequestError('Passwords do not match');
    }
    const auth: IAuthDocument | null = await authService.getAuthUserByPasswordToken(token);
    if (!auth) {
      throw new BadRequestError('Reset token has expired.');
    }

    auth.password = password;
    auth.passwordResetExpires = undefined;
    auth.passwordResetToken = undefined;
    await auth.save();

    emailQueue.sendConfirmPasswordEmailJob({ auth });

    res.status(HTTP_STATUS.OK).json({ message: 'Password successfully updated.' });
  }
}

export const passwordController: PasswordController = new PasswordController();
