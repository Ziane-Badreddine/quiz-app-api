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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { GetCategoriesDto } from './dto/get-categories.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'generated/prisma/enums';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiCookieAuth } from '@nestjs/swagger';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @SkipThrottle()
  async findAll(@Query() dto: GetCategoriesDto) {
    return await this.categoriesService.findAll(dto);
  }

  @Get(':categoryId')
  @HttpCode(HttpStatus.OK)
  async findOneById(@Param('categoryId', ParseUUIDPipe) categoryId: string) {
    return await this.categoriesService.findOneById(categoryId);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiCookieAuth()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateCategoryDto) {
    const newCategory = await this.categoriesService.create(dto);
    return {
      newCategory,
      message: 'category created successfully',
    };
  }

  @Patch(':categoryId')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    const updatedCategory = await this.categoriesService.update(
      categoryId,
      dto,
    );
    return {
      updatedCategory,
      message: 'category updated successfully',
    };
  }

  @Delete(':categoryId')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  async delete(@Param('categoryId', ParseUUIDPipe) categoryId: string) {
    await this.categoriesService.delete(categoryId);
    return {
      message: 'category deleted successfully',
    };
  }
}
