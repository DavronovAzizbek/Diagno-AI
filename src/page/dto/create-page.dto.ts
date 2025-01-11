import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePageDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  path: string;

  @IsOptional()
  isFavorite?: boolean;
}
