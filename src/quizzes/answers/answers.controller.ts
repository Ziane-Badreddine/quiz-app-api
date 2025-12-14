import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'generated/prisma/enums';
import { AnswersService } from './answers.service';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { ApiCookieAuth } from '@nestjs/swagger';

@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}
  @Patch(':answerId')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  public async updateAnswer(
    @Param('answerId', ParseUUIDPipe) answerId: string,
    @Body() dto: UpdateAnswerDto,
  ) {
    const updatedAnswer = await this.answersService.update(answerId, dto);
    return {
      message: 'Answer updated successfuly',
      updatedAnswer,
    };
  }

  @Delete(':answerId')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  public async deleteAnswer(
    @Param('answerId', ParseUUIDPipe) answerId: string,
  ) {
    await this.answersService.delete(answerId);
    return {
      message: 'Answer deleted successfuly',
    };
  }
}
