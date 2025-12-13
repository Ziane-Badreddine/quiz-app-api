import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailModule } from 'src/mail/mail.module';
import { OtpProvider } from './providers/otp.provider';
import { SessionProvider } from './providers/session.provider';

@Module({
  imports: [MailModule],
  controllers: [AuthController],
  providers: [AuthService, OtpProvider, SessionProvider, PrismaService],
})
export class AuthModule {}
