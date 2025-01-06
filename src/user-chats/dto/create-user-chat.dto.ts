import { IsBoolean, IsInt, IsOptional } from 'class-validator';

export class CreateUserChatDto {
  @IsInt()
  userId: number; // Foydalanuvchi ID-si

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean; // Chatni sevimli deb belgilash (ixtiyoriy)

  @IsOptional()
  content?: any[]; // Voqealar ro'yxati (ixtiyoriy)
}
