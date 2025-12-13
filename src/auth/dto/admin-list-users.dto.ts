import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export enum SearchField {
  EMAIL = 'email',
  NAME = 'name',
}

export enum SearchOperator {
  CONTAINS = 'contains',
  STARTS_WITH = 'startsWith',
  ENDS_WITH = 'endsWith',
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export enum FilterOperator {
  EQ = 'equals',
  NE = 'not',
  LT = 'lt',
  LTE = 'lte',
  GT = 'gt',
  GTE = 'gte',
}

export class AdminListUsersDto {
  @IsOptional()
  @IsString()
  searchValue?: string;

  @IsOptional()
  @IsEnum(SearchField, { message: 'searchField must be email or name' })
  searchField?: SearchField = SearchField.EMAIL;

  @IsOptional()
  @IsEnum(SearchOperator, {
    message: 'searchOperator must be contains, startsWith or endsWith',
  })
  searchOperator?: SearchOperator = SearchOperator.CONTAINS;

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

  @IsOptional()
  @IsString()
  sortBy?: string = 'email';

  @IsOptional()
  @IsEnum(SortDirection, { message: 'sortDirection must be asc or desc' })
  sortDirection?: SortDirection = SortDirection.ASC;

  @IsOptional()
  @IsString()
  filterField?: string;

  @IsOptional()
  filterValue?: string | number | boolean;

  @IsOptional()
  @IsEnum(FilterOperator, {
    message: 'filterOperator must be equals, not, lt, lte, gt or gte',
  })
  filterOperator?: FilterOperator = FilterOperator.EQ;
}
