import { Module } from '@nestjs/common';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CategoriesModule } from 'src/categories/categories.module';
import { QuestionsModule } from './questions/questions.module';
import { AnswersModule } from './answers/answers.module';

@Module({
  imports: [CategoriesModule, QuestionsModule, AnswersModule],
  controllers: [QuizzesController],
  providers: [QuizzesService, PrismaService, AuthGuard, RolesGuard],
})
export class QuizzesModule {}
