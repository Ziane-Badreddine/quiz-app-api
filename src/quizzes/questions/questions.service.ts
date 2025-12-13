import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  public async createMany(quizId: string, dto: CreateQuestionDto[]) {
    const quiz = await this.prisma.quiz.findUnique({
      where: {
        id: quizId,
      },
    });

    if (!quiz) {
      throw new NotFoundException('quiz not found');
    }
    return await this.prisma.question.createMany({
      data: dto.map((q) => ({
        ...q,
        quizId,
      })),
      skipDuplicates: true,
    });
  }

  public async create(quizId: string, dto: CreateQuestionDto) {
    const quiz = await this.prisma.quiz.findUnique({
      where: {
        id: quizId,
      },
    });

    if (!quiz) {
      throw new NotFoundException('quiz not found');
    }
    return await this.prisma.question.create({
      data: {
        ...dto,
        quizId,
      },
    });
  }

  public async update(questionId: string, dto: UpdateQuestionDto) {
    const question = await this.prisma.question.findUnique({
      where: {
        id: questionId,
      },
    });
    if (!question) {
      throw new NotFoundException('question not found');
    }
    return await this.prisma.question.update({
      data: {
        ...dto,
      },
      where: {
        id: questionId,
      },
    });
  }

  public async delete(questionId: string) {
    const question = await this.prisma.question.findUnique({
      where: {
        id: questionId,
      },
    });
    if (!question) {
      throw new NotFoundException('question not found');
    }

    return await this.prisma.question.delete({
      where: {
        id: questionId,
      },
    });
  }
}
