import { IsEmail, IsNotEmpty } from 'class-validator';

export class VerificationDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
