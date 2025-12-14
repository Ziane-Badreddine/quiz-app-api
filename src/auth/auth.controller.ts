import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { SessionType, type CurrentUserType } from 'src/types/user';
import { Session } from './decorators/session.decorator';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AdminListUsersDto } from './dto/admin-list-users.dto';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from 'generated/prisma/enums';
import { AdminSetRoleDto } from './dto/admin-set-role.dto';
import { CacheTTL } from '@nestjs/cache-manager';
import { SendVerificationOtp } from './dto/send-verification-otp.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SessionProvider } from './providers/session.provider';
import { SkipThrottle } from '@nestjs/throttler';
import { Request } from 'express';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ApiCookieAuth } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionProvider: SessionProvider,
  ) {}
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    const { name, email, password } = registerDto;
    await this.authService.register(name, email, password);
    return {
      message: 'Account created. Verification OTP sent.',
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Session() session: SessionType, @Body() loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.authService.login(email, password);
    session.user = user;
    return {
      message: 'Login successfully',
      user,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Session() session: SessionType) {
    session.destroy((err) => {
      if (err) {
        throw new UnauthorizedException('Logout failed');
      }
    });

    return { message: 'Logged out successfully' };
  }

  @Get('current-user')
  @HttpCode(HttpStatus.OK)
  @SkipThrottle()
  getCurrentUser(@CurrentUser() user: CurrentUserType | undefined) {
    if (!user) return { user: null };
    return { user };
  }

  @Get('session/:sessionId')
  @HttpCode(HttpStatus.OK)
  @SkipThrottle()
  getSession(@Param('sessionId') sessionId: string) {
    return this.authService.getSession(sessionId);
  }

  @Get('admin/list-users')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiCookieAuth()
  @CacheTTL(70000)
  @HttpCode(HttpStatus.OK)
  async listUsers(@Query() dto: AdminListUsersDto) {
    return await this.authService.listUsers(dto);
  }

  @Post('admin/set-role')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  async setRole(@Body() dto: AdminSetRoleDto) {
    const user = await this.authService.setRole(dto.userId, dto.role);
    return {
      message: `User role updated successfully to ${dto.role}`,
      user,
    };
  }

  @Post('send-email-verification')
  @HttpCode(HttpStatus.OK)
  async sendVerficationEmail(@Body() dto: SendVerificationOtp) {
    await this.authService.sendVerificationEmail(dto.email);
    return {
      message: 'Verification email OTP sent successfully',
    };
  }

  @Post('send-password-reset')
  @HttpCode(HttpStatus.OK)
  async sendPasswordReset(@Body() dto: SendVerificationOtp) {
    await this.authService.sendPasswordReset(dto.email);
    return {
      message: 'Password reset OTP sent successfully',
    };
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyOtpDto) {
    const { email, otp } = dto;
    await this.authService.verifyEmail(email, otp);

    return { message: 'Email verified successfully' };
  }

  @Post('verify-password-reset')
  @HttpCode(HttpStatus.OK)
  async verifyPasswordReset(@Body() dto: VerifyOtpDto) {
    const { email, otp } = dto;
    await this.authService.verifyPasswordReset(email, otp);

    return { message: 'OTP verified successfully' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const { email, newPassword } = dto;
    await this.authService.resetPassword(email, newPassword);

    return { message: 'Password reset successfully' };
  }

  @Patch('update-user')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  async updateUser(
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: CurrentUserType,
    @Session() session: SessionType,
  ) {
    const userUpdated = await this.authService.updateUser(dto, user.id);
    session.user = userUpdated;
    return {
      messsage: 'User updated successfully',
      userUpdated,
    };
  }

  @Patch('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @CurrentUser() user: CurrentUserType,
    @Session() session: SessionType,
  ) {
    await this.authService.changePassword(dto, user.id);

    if (dto.revokeOtherSessions) {
      await this.sessionProvider.revokeAllUserSessions(user.id, session.id);
      return {
        message:
          'Password changed successfully. All other sessions have been revoked.',
      };
    }
    return {
      message: 'Password changed successfully.',
    };
  }
}
