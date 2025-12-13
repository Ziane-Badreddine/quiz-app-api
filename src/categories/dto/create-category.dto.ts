import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  title: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsString()
  image?: string;
}
