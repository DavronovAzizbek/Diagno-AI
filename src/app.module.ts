import { Module } from '@nestjs/common';
import { ChatsModule } from './chat/chat.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './chat/entities/chat.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './auth/entities/user.entity';
import { PagesModule } from './page/page.module';
import { Page } from './page/entities/page.entity';
import { DoctorModule } from './doctor/doctor.module';
import { Doctor } from './doctor/entities/doctor.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'dpg-cudtiut2ng1s73enlsvg-a',
      port: 5432,
      username: 'fullstack_l413_user',
      password: 'u6R9iUGSe0I11HPRTJafJiSNnRwXZvao',
      database: 'fullstack_l413',
      entities: [Chat, User, Page, Doctor],
      synchronize: true,
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    ChatsModule,
    AuthModule,
    UsersModule,
    PagesModule,
    DoctorModule,
  ],
})
export class AppModule {}
