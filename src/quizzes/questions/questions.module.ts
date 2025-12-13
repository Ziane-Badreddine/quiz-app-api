import { Module } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { QuestionController } from './question.controller';
import { AnswersModule } from '../answers/answers.module';

@Module({
  imports: [AnswersModule],
  controllers: [QuestionController],
  providers: [QuestionsService, PrismaService, AuthGuard, RolesGuard],
  exports: [QuestionsService],
})
export class QuestionsModule {}
