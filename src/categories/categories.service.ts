import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { GetCategoriesDto, SearchField } from './dto/get-categories.dto';
import {
  CategoryOrderByWithAggregationInput,
  CategoryWhereInput,
} from 'generated/prisma/models';
import {
  SearchOperator,
  SortDirection,
} from 'src/auth/dto/admin-list-users.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll(dto: GetCategoriesDto) {
    const filters: CategoryWhereInput = {};
    const orderBy: CategoryOrderByWithAggregationInput = {};
    if (dto.searchValue) {
      const field = dto.searchField ?? SearchField.TITLE;
      const operator = dto.searchOperator ?? SearchOperator.CONTAINS;
      filters[field] = {
        [operator]: dto.searchValue,
        mode: 'insensitive',
      };
    }
    if (dto.sortBy) {
      const sortDirection = dto.sortDirection ?? SortDirection.ASC;
      orderBy[dto.sortBy] = sortDirection;
    }

    const categories = await this.prisma.category.findMany({
      where: filters,
      orderBy,
      take: dto.limit,
      skip: dto.offset,
      include: {
        _count: {
          select: {
            quizzes: true,
          },
        },
      },
    });

    const total = await this.prisma.category.count({ where: filters });

    return {
      total,
      categories,
    };
  }
  async findOneById(categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });
    if (!category) {
      throw new NotFoundException('category not found');
    }
    return category;
  }
  async create(dto: CreateCategoryDto) {
    const { title, description, image } = dto;

    return await this.prisma.category.create({
      data: { title, description, image },
    });
  }
  async update(categoryId: string, dto: UpdateCategoryDto) {
    await this.findOneById(categoryId);
    return await this.prisma.category.update({
      data: {
        ...dto,
      },
      where: {
        id: categoryId,
      },
    });
  }

  async delete(categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });
    if (!category) {
      throw new NotFoundException('category not found');
    }
    return await this.prisma.category.delete({
      where: {
        id: categoryId,
      },
    });
  }
}
