import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, RequestTimeoutException } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  public async sendLogInEmail(email: string, name: string, code: number) {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: '<no-reply@quiz-app.com>',
        subject: 'login',
        template: 'login',
        context: { name, code, year: new Date().getFullYear() },
      });
    } catch {
      throw new RequestTimeoutException();
    }
  }

  public async sendVerificationOtp(email: string, name: string, code: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: '<no-reply@quiz-app.com>',
        subject: 'Verify your email',
        template: 'register',
        context: {
          name,
          code,
          year: new Date().getFullYear(),
        },
      });
    } catch {
      throw new RequestTimeoutException();
    }
  }

  public async sendForgetPasswordOtp(email: string, name: string, otp: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Password Reset Code',
        template: './forgot-password',
        context: {
          name,
          otp,
          year: new Date().getFullYear(),
        },
      });
    } catch {
      throw new RequestTimeoutException();
    }
  }
}
