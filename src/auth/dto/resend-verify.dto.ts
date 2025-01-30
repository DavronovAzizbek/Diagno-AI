import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendVerifyDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
