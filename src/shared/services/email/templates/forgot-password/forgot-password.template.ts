import fs from 'fs';
import ejs from 'ejs';

export class ForgotPasswordTemplate {
  public getTemplate(username: string, resetLink: string) {
    return ejs.render(fs.readFileSync(__dirname + '/forgot-password.template.ejs', 'utf-8'), {
      username,
      resetLink,
      image_url: 'https://w7.pngwing.com/pngs/120/102/png-transparent-padlock-logo-computer-icons-padlock-technic-logo-password-lock.png'
    });
  }
}

export const forgotPasswordTemplate: ForgotPasswordTemplate = new ForgotPasswordTemplate();
