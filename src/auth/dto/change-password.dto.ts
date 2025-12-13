import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  newPassword: string;
  @IsNotEmpty()
  @IsString()
  currentPassword: string;
  @IsBoolean()
  @IsOptional()
  revokeOtherSessions: boolean;
}
