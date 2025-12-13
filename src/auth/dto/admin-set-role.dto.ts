import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { UserRole } from 'generated/prisma/enums';

export class AdminSetRoleDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  @IsEnum(UserRole, {
    message: `role must be one of: ${Object.values(UserRole).join(', ')}`,
  })
  role: UserRole;
}
