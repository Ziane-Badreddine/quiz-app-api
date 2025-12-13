import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import {
  SearchOperator,
  SortDirection,
} from 'src/auth/dto/admin-list-users.dto';
import { QuizLevel } from 'generated/prisma/enums';

export enum SearchField {
  TITLE = 'title',
  DESCRIPTION = 'description',
}

export class GetQuizzesDto {
  @IsOptional()
  @IsString()
  searchValue?: string;

  @IsOptional()
  @Transform(({ value }: { value: SearchField[] }) => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  })
  @IsEnum(SearchField, { each: true })
  searchFields?: SearchField[] = [SearchField.TITLE, SearchField.DESCRIPTION];

  @IsOptional()
  @IsEnum(SearchOperator)
  searchOperator?: SearchOperator = SearchOperator.CONTAINS;

  @IsOptional()
  @IsString()
  sortBy?: string = 'title';

  @IsOptional()
  @IsEnum(SortDirection, { message: 'sortDirection must be asc or desc' })
  sortDirection?: SortDirection = SortDirection.ASC;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: 'limit must be a number' })
  @Min(1, { message: 'limit must be >= 1' })
  limit?: number = 10;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: 'offset must be a number' })
  @Min(0, { message: 'offset must be >= 0' })
  offset?: number = 0;

  @IsOptional()
  @IsString()
  categoryId?: string;
  @IsOptional()
  @IsEnum(QuizLevel, {
    message: 'level must be hard , meduim or easy',
  })
  level: QuizLevel;
}
