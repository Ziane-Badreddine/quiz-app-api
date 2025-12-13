import { IsBoolean, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class AddAnswerDto {
  @IsNotEmpty()
  @IsUUID()
  questionId: string;
  @IsNotEmpty()
  @IsUUID()
  answerId: string;
  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;
}
