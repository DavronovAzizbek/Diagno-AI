import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateChatDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  path: string;

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;
}
