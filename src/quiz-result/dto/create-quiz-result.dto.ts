import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateQuizResultDto {
  @IsNotEmpty()
  @IsUUID()
  quizId: string;
}
