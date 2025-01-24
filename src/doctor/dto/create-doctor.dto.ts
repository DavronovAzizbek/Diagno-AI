import {
  IsString,
  IsArray,
  IsBoolean,
  IsNumber,
  IsEmail,
  IsNotEmpty,
} from 'class-validator';

export class CreateDoctorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsNotEmpty()
  specialty: string[];

  @IsString()
  profileImage: string;

  @IsString()
  contact1: string;

  @IsString()
  contact2: string;

  @IsEmail()
  email: string;

  @IsString()
  experience: string;

  @IsString()
  clinic: string;

  @IsBoolean()
  isFavorite: boolean;

  @IsString()
  description: string;

  @IsArray()
  @IsNotEmpty()
  comment: string[];

  @IsArray()
  languages: string[];

  @IsString()
  gender: string;

  @IsNumber()
  rating: number;

  @IsNumber()
  reviews: number;
}
