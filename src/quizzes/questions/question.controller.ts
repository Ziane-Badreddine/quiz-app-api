import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'generated/prisma/enums';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { AnswersService } from '../answers/answers.service';
import { CreateAnswerDto } from '../answers/dto/create-answer.dto';
import { ApiCookieAuth } from '@nestjs/swagger';

@Controller('questions')
export class QuestionController {
  constructor(
    private readonly questionsService: QuestionsService,
    private readonly answersService: AnswersService,
  ) {}
  @Patch(':questionId')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  public async updateQuestion(
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @Body() dto: UpdateQuestionDto,
  ) {
    const updatedQuestion = await this.questionsService.update(questionId, dto);
    return {
      message: 'Question updated successfuly',
      updatedQuestion,
    };
  }

  @Delete(':questionId')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  public async deleteQuestion(
    @Param('questionId', ParseUUIDPipe) questionId: string,
  ) {
    await this.questionsService.delete(questionId);
    return {
      message: 'Question deleted successfuly',
    };
  }

  @Post(':questionId/answers')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiCookieAuth()
  @HttpCode(HttpStatus.CREATED)
  public async createMany(
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @Body() dto: CreateAnswerDto[],
  ) {
    const result = await this.answersService.createMany(questionId, dto);

    return {
      message: 'Answers created successfully',
      count: result.count,
    };
  }

  @Post(':questionId/answer')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiCookieAuth()
  @HttpCode(HttpStatus.CREATED)
  public async createQuestion(
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @Body() dto: CreateAnswerDto,
  ) {
    const question = await this.answersService.create(questionId, dto);

    return {
      message: 'Answer created successfully',
      question,
    };
  }
}
