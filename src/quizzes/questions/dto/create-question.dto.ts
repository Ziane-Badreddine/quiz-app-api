import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { QuestionType } from 'generated/prisma/enums';

export class CreateQuestionDto {
  @IsNotEmpty()
  @IsString()
  text: string;
  @IsOptional()
  @IsString()
  image?: string;
  @IsOptional()
  @IsEnum(QuestionType)
  type?: QuestionType;
  @IsOptional()
  @IsString()
  explanation: string;
}
