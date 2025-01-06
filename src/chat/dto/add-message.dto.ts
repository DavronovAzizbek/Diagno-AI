import { IsString, IsNotEmpty } from 'class-validator';

export class AddMessageDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  author: string; // Xabarni kim yozgan
}
