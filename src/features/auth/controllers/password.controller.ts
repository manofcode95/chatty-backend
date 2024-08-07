import { Request, Response } from 'express';
import { config } from '@root/config';
import moment from 'moment';
import publicIP from 'ip';
import HTTP_STATUS from 'http-status-codes';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { emailSchema, passwordSchema } from '@auth/schemes/password';
import crypto from 'crypto';
import { IResetPasswordParams } from '@user/interfaces/user.interface';
import { BadRequestError } from '@globals/helpers/error-handler';
import { joiValidation } from '@root/shared/globals/decorators/joi-validation.decorator';
import { authService } from '@services/db/auth.service';
import { forgotPasswordTemplate } from '@services/email/templates/forgot-password/forgot-password.template';
import { emailQueue } from '@services/queue/email.queue';
import { resetPasswordTemplate } from '@services/email/templates/reset-password/reset-password.template';

export class PasswordController {
  @joiValidation(emailSchema)
  public async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    const existingUser: IAuthDocument | null = await authService.getAuthUserByEmail(email);
    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }

    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacters: string = randomBytes.toString('hex');
    await authService.updatePasswordToken(`${existingUser._id!}`, randomCharacters, Date.now() * 60 * 60 * 1000);

    const resetLink = `${config.CLIENT_URL}/reset-password?token=${randomCharacters}`;
    const template: string = forgotPasswordTemplate.getTemplate(existingUser.username!, resetLink);
    emailQueue.addEmailJob('sendForgotPasswordEmail', { template, receiverEmail: email, subject: 'Reset your password' });
    res.status(HTTP_STATUS.OK).json({ message: 'Password reset email sent.' });
  }

  @joiValidation(passwordSchema)
  public async updatePassword(req: Request, res: Response): Promise<void> {
    const { password, confirmPassword } = req.body;
    const { token } = req.params;
    if (password !== confirmPassword) {
      throw new BadRequestError('Passwords do not match');
    }
    const existingUser: IAuthDocument | null = await authService.getAuthUserByPasswordToken(token);
    if (!existingUser) {
      throw new BadRequestError('Reset token has expired.');
    }

    existingUser.password = password;
    existingUser.passwordResetExpires = undefined;
    existingUser.passwordResetToken = undefined;
    await existingUser.save();

    const templateParams: IResetPasswordParams = {
      username: existingUser.username!,
      email: existingUser.email!,
      ipaddress: publicIP.address(),
      date: moment().format('DD//MM//YYYY HH:mm')
    };
    const template: string = resetPasswordTemplate.getTemplate(templateParams);
    emailQueue.addEmailJob('forgotPasswordEmail', { template, receiverEmail: existingUser.email!, subject: 'Password Reset Confirmation' });
    res.status(HTTP_STATUS.OK).json({ message: 'Password successfully updated.' });
  }
}

export const passwordController: PasswordController = new PasswordController();
