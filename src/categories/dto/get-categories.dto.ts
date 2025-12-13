import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import {
  SearchOperator,
  SortDirection,
} from 'src/auth/dto/admin-list-users.dto';

export enum SearchField {
  TITLE = 'title',
  DESCRIPTION = 'description',
}

export class GetCategoriesDto {
  @IsOptional()
  @IsString()
  searchValue?: string;

  @IsOptional()
  @IsEnum(SearchField, { message: 'searchField must be title or description' })
  searchField?: SearchField = SearchField.TITLE;

  @IsOptional()
  @IsEnum(SearchOperator, {
    message: 'searchOperator must be contains, startsWith or endsWith',
  })
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
  limit?: number = 100;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: 'offset must be a number' })
  @Min(0, { message: 'offset must be >= 0' })
  offset?: number = 0;
}
