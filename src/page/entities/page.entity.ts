import {
  IsString,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsDate,
  IsNumber,
  IsJSON,
} from 'class-validator';

export class Page {
  @IsNumber()
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  path: string;

  @IsBoolean()
  @IsOptional()
  isFavorite: boolean;

  @IsJSON()
  @IsNotEmpty()
  content: string;

  @IsDate()
  createAt: Date;

  @IsDate()
  updateAt: Date;
}
