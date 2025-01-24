import { Module } from '@nestjs/common';
import { ChatsModule } from './chat/chat.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './chat/entities/chat.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './auth/entities/user.entity';
import { PagesModule } from './page/page.module';
import { Page } from './page/entities/page.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'azizbek002',
      database: 'chat7',
      entities: [Chat, User, Page],
      synchronize: true,
    }),
    ChatsModule,
    AuthModule,
    UsersModule,
    PagesModule,
  ],
})
export class AppModule {}
