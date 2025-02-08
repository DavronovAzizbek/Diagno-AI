import { IsOptional, IsString } from 'class-validator';

export class CreateRequestDto {
  @IsOptional()
  @IsString()
  question?: string;
}
