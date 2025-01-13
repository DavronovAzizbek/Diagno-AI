import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class EditMessageDto {
  @IsString()
  @IsNotEmpty()
  messageId: string;

  @IsString()
  @IsOptional()
  newMessage?: string;
}
