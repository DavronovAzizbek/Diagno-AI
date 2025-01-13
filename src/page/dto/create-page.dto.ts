import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  IsJSON,
} from 'class-validator';

export class CreatePageDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  path?: string;

  @IsBoolean()
  @IsOptional()
  isFavorite?: boolean;

  @IsJSON()
  @IsNotEmpty()
  content: string;
}
