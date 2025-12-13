import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { redisClient } from 'src/lib/redis';
import { MailService } from 'src/mail/mail.service';
import { OtpType } from 'src/types/otp';

@Injectable()
export class OtpProvider {
  constructor(private readonly mailService: MailService) {}

  private getRedisKey(type: OtpType, userId: string) {
    return `otp:${type}:${userId}`;
  }

  async sendOtp({
    userId,
    email,
    name,
    type,
  }: {
    userId: string;
    email: string;
    name: string;
    type: OtpType;
  }) {
    const otp = this.generateSecureOtp();

    await redisClient.set(this.getRedisKey(type, userId), otp, {
      expiration: { type: 'EX', value: 300 },
    });
    if (type === OtpType.EMAIL_VERIFICATION) {
      await this.mailService.sendVerificationOtp(email, name, otp);
    } else if (type === OtpType.FORGOT_PASSWORD) {
      await this.mailService.sendForgetPasswordOtp(email, name, otp);
    }
  }

  async verifyOtp({
    userId,
    otp,
    type,
  }: {
    userId: string;
    otp: string;
    type: OtpType;
  }) {
    const key = this.getRedisKey(type, userId);
    const storedOtp = await redisClient.get(key);

    if (!storedOtp || storedOtp !== otp)
      throw new UnauthorizedException('Invalid OTP');

    await redisClient.del(key);

    if (type === OtpType.FORGOT_PASSWORD) {
      await redisClient.set(`passwordResetVerified:${userId}`, 'true', {
        expiration: { type: 'EX', value: 600 },
      });
    }
  }

  public generateSecureOtp(): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const bytes = randomBytes(6);
    let otp = '';
    for (let i = 0; i < 6; i++) {
      otp += chars[bytes[i] % chars.length];
    }
    return otp;
  }
}
