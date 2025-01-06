import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class EditMessageDto {
  @IsString()
  @IsNotEmpty()
  messageId: string; // Xabarning noyob identifikatori

  @IsString()
  @IsOptional()
  newMessage?: string; // Tahrirlangan matn
}
