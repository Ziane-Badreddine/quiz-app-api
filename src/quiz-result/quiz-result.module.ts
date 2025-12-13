import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QuizResultService } from './quiz-result.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Module({
  providers: [PrismaService, QuizResultService, AuthGuard],
})
export class QuizResultModule {}
