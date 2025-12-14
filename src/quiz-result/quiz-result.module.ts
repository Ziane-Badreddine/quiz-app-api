import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QuizResultService } from './quiz-result.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { QuizResultController } from './quiz-result.controller';

@Module({
  controllers: [QuizResultController],
  providers: [PrismaService, QuizResultService, AuthGuard],
})
export class QuizResultModule {}
