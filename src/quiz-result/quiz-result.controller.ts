import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QuizResultService } from './quiz-result.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CurrentUserType } from 'src/types/user';
import { CreateQuizResultDto } from './dto/create-quiz-result.dto';
import { AddAnswerDto } from './dto/add-answer.dto';

@Controller('quiz-result')
export class QuizResultController {
  constructor(private readonly quizResultService: QuizResultService) {}

  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  public async create(
    @CurrentUser() currentUser: CurrentUserType,
    @Body() dto: CreateQuizResultDto,
  ) {
    const quizResult = await this.quizResultService.create(
      currentUser.id,
      dto.quizId,
    );

    return {
      message: 'quizResult created successfully',
      quizResult,
    };
  }

  @Get()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  public async findOne(
    @CurrentUser() currentUser: CurrentUserType,
    @Query('quizId', ParseUUIDPipe) quizId: string,
  ) {
    const quizResult = await this.quizResultService.findOne(
      currentUser.id,
      quizId,
    );

    return quizResult;
  }

  @Patch(':quizResultId/answer')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  public async addAnswer(
    @Param('quizResultId', ParseUUIDPipe) quizResultId: string,
    @Body() answer: AddAnswerDto,
  ) {
    const quizResult = await this.quizResultService.addAnswer(
      quizResultId,
      answer,
    );

    return quizResult;
  }

  @Patch(':quizResultId/restart')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  restartQuiz(@Param('quizResultId') quizResultId: string) {
    return this.quizResultService.restartQuiz(quizResultId);
  }
}
