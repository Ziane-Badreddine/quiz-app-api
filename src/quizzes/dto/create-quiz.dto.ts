import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { QuizLevel } from 'generated/prisma/enums';

export class CreateQuizDto {
  @IsNotEmpty()
  @IsString()
  title: string;
  @IsNotEmpty()
  @IsString()
  description: string;
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ enum: QuizLevel, default: QuizLevel.EASY })
  @IsOptional()
  @IsEnum(QuizLevel, {
    message: `quiz level must be one of: ${Object.values(QuizLevel).join(', ')}`,
  })
  level?: QuizLevel;
  @IsNotEmpty()
  @IsUUID()
  categoryId: string;
}
