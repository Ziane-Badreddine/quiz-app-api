import {
  Body,
  Controller,
  Delete,
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
import { QuizzesService } from './quizzes.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'generated/prisma/enums';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { GetQuizzesDto } from './dto/get-quizzes.dto';
import { QuestionsService } from './questions/questions.service';
import { CreateQuestionDto } from './questions/dto/create-question.dto';
import { AnswersService } from './answers/answers.service';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiCookieAuth } from '@nestjs/swagger';

@Controller('quizzes')
export class QuizzesController {
  constructor(
    private readonly quizzesService: QuizzesService,
    private readonly questionsService: QuestionsService,
    private readonly answersSevice: AnswersService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiCookieAuth()
  @HttpCode(HttpStatus.CREATED)
  public async createQuiz(@Body() dto: CreateQuizDto) {
    const newQuiz = await this.quizzesService.create(dto);
    return {
      message: 'Quiz created successfuly',
      newQuiz,
    };
  }

  @Patch(':quizId')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  public async updateQuiz(
    @Param('quizId', ParseUUIDPipe) quizId: string,
    @Body() dto: UpdateQuizDto,
  ) {
    const updatedQuiz = await this.quizzesService.update(quizId, dto);
    return {
      message: 'Quiz updated successfuly',
      updatedQuiz,
    };
  }

  @Delete(':quizId')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  public async deleteQuiz(@Param('quizId', ParseUUIDPipe) quizId: string) {
    const deletedQuestion = await this.quizzesService.delete(quizId);
    return {
      message: 'Quiz deleted successfuly',
      deletedQuestion,
    };
  }

  @Get(':quizId')
  @HttpCode(HttpStatus.OK)
  public async finOneById(@Param('quizId', ParseUUIDPipe) quizId: string) {
    return await this.quizzesService.findOneById(quizId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @SkipThrottle()
  public async findAll(@Query() dto: GetQuizzesDto) {
    return await this.quizzesService.findAll(dto);
  }

  @Post(':quizId/questions')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiCookieAuth()
  @HttpCode(HttpStatus.CREATED)
  public async createMany(
    @Param('quizId', ParseUUIDPipe) quizId: string,
    @Body() dto: CreateQuestionDto[],
  ) {
    const result = await this.questionsService.createMany(quizId, dto);

    return {
      message: 'Questions created successfully',
      count: result.count,
    };
  }

  @Post(':quizId/question')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiCookieAuth()
  @HttpCode(HttpStatus.CREATED)
  public async createQuestion(
    @Param('quizId', ParseUUIDPipe) quizId: string,
    @Body() dto: CreateQuestionDto,
  ) {
    const question = await this.questionsService.create(quizId, dto);

    return {
      message: 'Question created successfully',
      question,
    };
  }
}
