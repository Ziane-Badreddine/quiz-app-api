import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { hash, genSalt, compare } from 'bcrypt';
import {
  AdminListUsersDto,
  FilterOperator,
  SearchField,
  SearchOperator,
  SortDirection,
} from './dto/admin-list-users.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRole } from 'generated/prisma/enums';
import {
  UserOrderByWithAggregationInput,
  UserWhereInput,
} from 'generated/prisma/models';
import { OtpProvider } from './providers/otp.provider';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { redisClient } from 'src/lib/redis';
import { OtpType } from 'src/types/otp';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly otpProvider: OtpProvider,
  ) {}
  async register(name: string, email: string, password: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    const salt = await genSalt(10);
    const passwordHashed = await hash(password, salt);
    const newUser = await this.prisma.user.create({
      data: {
        name,
        email,
        password: passwordHashed,
      },
    });

    await this.otpProvider.sendOtp({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      type: OtpType.EMAIL_VERIFICATION,
    });
  }

  async verifyEmail(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    await this.otpProvider.verifyOtp({
      userId: user.id,
      otp,
      type: OtpType.EMAIL_VERIFICATION,
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        password: true,
        emailVerified: true,
        role: true,
        banned: true,
        banReason: true,
        banExpires: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.banned) {
      throw new UnauthorizedException({
        message: 'Account is banned',
        reason: user.banReason || 'No reason provided',
        expires: user.banExpires || null,
      });
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException('Email not verified');
    }

    const {
      password: _password,
      banned: _banned,
      banReason: _banReason,
      banExpires: _banExpires,
      ...safeUser
    } = user;
    return safeUser;
  }

  async sendVerificationEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    await this.otpProvider.sendOtp({
      userId: user.id,
      email: user.email,
      name: user.name,
      type: OtpType.EMAIL_VERIFICATION,
    });
  }

  async updateUser(dto: UpdateUserDto, userId: string) {
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...dto,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        emailVerified: true,
        role: true,
      },
    });

    return user;
  }

  async changePassword(dto: ChangePasswordDto, userId: string) {
    const { currentPassword, newPassword } = dto;
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await compare(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const salt = await genSalt(10);
    const passwordHashed = await hash(newPassword, salt);

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: passwordHashed,
      },
    });
  }

  async listUsers(dto: AdminListUsersDto) {
    const filters: UserWhereInput = {};
    const orderBy: UserOrderByWithAggregationInput = {};

    if (dto.searchValue) {
      const field = dto.searchField ?? SearchField.EMAIL;
      const operator = dto.searchOperator ?? SearchOperator.CONTAINS;
      filters[field] = {
        [operator]: dto.searchValue,
        mode: 'insensitive',
      };
    }

    if (dto.filterField && dto.filterValue) {
      const filterOperator = dto.filterOperator || FilterOperator.EQ;
      filters[dto.filterField] = {
        [filterOperator]: dto.filterValue,
      };
    }

    if (dto.sortBy) {
      const sortDirection = dto.sortDirection ?? SortDirection.ASC;
      orderBy[dto.sortBy] = sortDirection;
    }

    const users = await this.prisma.user.findMany({
      where: filters,
      orderBy,
      take: dto.limit,
      skip: dto.offset,
    });

    const total = await this.prisma.user.count({ where: filters });

    return { total, users };
  }

  async setRole(userId: string, role: UserRole) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (existingUser.role === UserRole.ADMIN) {
      throw new BadRequestException('Cannot change role of an admin user');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }

  async getSession(sessionId: string) {
    const session = await redisClient.get(sessionId);
    if (!session) {
      return null;
    }

    return session;
  }

  async sendPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    await this.otpProvider.sendOtp({
      userId: user.id,
      email: user.email,
      name: user.name,
      type: OtpType.FORGOT_PASSWORD,
    });
  }

  async verifyPasswordReset(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    await this.otpProvider.verifyOtp({
      userId: user.id,
      otp,
      type: OtpType.FORGOT_PASSWORD,
    });
  }
  async resetPassword(email: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    const verified = await redisClient.get(`passwordResetVerified:${user.id}`);
    if (!verified) throw new UnauthorizedException('OTP not verified');

    const salt = await genSalt(10);
    const hashed = await hash(newPassword, salt);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    await redisClient.del(`passwordResetVerified:${user.id}`);
  }
}
