import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class VerifyDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  verificationCode: string;
}
