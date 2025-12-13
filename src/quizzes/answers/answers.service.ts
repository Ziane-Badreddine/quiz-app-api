import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';

@Injectable()
export class AnswersService {
  constructor(private readonly prisma: PrismaService) {}
  public async createMany(questionId: string, dto: CreateAnswerDto[]) {
    const question = await this.prisma.question.findUnique({
      where: {
        id: questionId,
      },
    });

    if (!question) {
      throw new NotFoundException('question not found');
    }
    return await this.prisma.answer.createMany({
      data: dto.map((a) => ({
        ...a,
        questionId,
      })),
      skipDuplicates: true,
    });
  }

  public async create(questionId: string, dto: CreateAnswerDto) {
    const question = await this.prisma.question.findUnique({
      where: {
        id: questionId,
      },
    });

    if (!question) {
      throw new NotFoundException('question not found');
    }
    return await this.prisma.answer.create({
      data: {
        ...dto,
        questionId,
      },
    });
  }

  public async update(answerId: string, dto: UpdateAnswerDto) {
    const answer = await this.prisma.answer.findUnique({
      where: {
        id: answerId,
      },
    });
    if (!answer) {
      throw new NotFoundException('answer not found');
    }
    return await this.prisma.answer.update({
      data: {
        ...dto,
      },
      where: {
        id: answerId,
      },
    });
  }

  public async delete(answerId: string) {
    const answer = await this.prisma.answer.findUnique({
      where: {
        id: answerId,
      },
    });
    if (!answer) {
      throw new NotFoundException('answer not found');
    }

    return await this.prisma.answer.delete({
      where: {
        id: answerId,
      },
    });
  }
}
