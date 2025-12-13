import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { CategoriesService } from 'src/categories/categories.service';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { GetQuizzesDto } from './dto/get-quizzes.dto';
import {
  QuizOrderByWithAggregationInput,
  QuizWhereInput,
} from 'generated/prisma/models';
import {
  SearchOperator,
  SortDirection,
} from 'src/auth/dto/admin-list-users.dto';

@Injectable()
export class QuizzesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoriesService: CategoriesService,
  ) {}

  public async findAll(dto: GetQuizzesDto) {
    const where: QuizWhereInput = {};
    const orderBy: QuizOrderByWithAggregationInput = {};
    if (dto.searchValue && dto.searchFields?.length) {
      const operator = dto.searchOperator ?? SearchOperator.CONTAINS;

      where.OR = dto.searchFields.map((field) => ({
        [field]: {
          [operator]: dto.searchValue,
          mode: 'insensitive',
        },
      }));
    }
    if (dto.sortBy) {
      const sortDirection = dto.sortDirection ?? SortDirection.ASC;
      orderBy[dto.sortBy] = sortDirection;
    }

    if (dto.categoryId) {
      where.categoryId = dto.categoryId;
    }

    if (dto.level) {
      where.level = dto.level;
    }

    const quizzes = await this.prisma.quiz.findMany({
      where,
      orderBy,
      take: dto.limit,
      skip: dto.offset,
    });

    const total = await this.prisma.quiz.count({ where });

    return {
      total,
      quizzes,
    };
  }

  public async findOneById(quizId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: {
        id: quizId,
      },
      include: {
        questions: {
          include: {
            answers: true,
          },
        },
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });
    if (!quiz) {
      throw new NotFoundException('quiz not found');
    }
    return quiz;
  }
  public async create(dto: CreateQuizDto) {
    await this.categoriesService.findOneById(dto.categoryId);
    return await this.prisma.quiz.create({
      data: {
        ...dto,
      },
    });
  }

  public async update(quizId: string, dto: UpdateQuizDto) {
    const quiz = await this.prisma.quiz.findUnique({
      where: {
        id: quizId,
      },
    });
    if (!quiz) {
      throw new NotFoundException('quiz not found');
    }
    return await this.prisma.quiz.update({
      data: {
        ...dto,
      },
      where: {
        id: quizId,
      },
    });
  }

  public async delete(quizId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: {
        id: quizId,
      },
    });
    if (!quiz) {
      throw new NotFoundException('question not found');
    }

    return await this.prisma.question.delete({
      where: {
        id: quizId,
      },
    });
  }
}
