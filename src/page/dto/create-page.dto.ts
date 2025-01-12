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
  @IsOptional() // Path ixtiyoriy bo'lishi kerak
  path?: string;

  @IsBoolean()
  @IsOptional()
  isFavorite?: boolean;

  @IsJSON()
  @IsNotEmpty()
  content: string;
}
