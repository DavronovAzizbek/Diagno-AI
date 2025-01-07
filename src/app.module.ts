import { Module } from '@nestjs/common';
import { ChatsModule } from './chat/chat.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './chat/entities/chat.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './auth/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'azizbek002',
      database: 'chat1',
      entities: [Chat, User],
      synchronize: true,
    }),
    ChatsModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
