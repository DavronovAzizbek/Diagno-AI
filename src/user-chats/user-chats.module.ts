import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from 'src/chat/entities/chat.entity';
import { UserChatsService } from './user-chats.service';
import { UserChatsController } from './user-chats.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Chat])],
  controllers: [UserChatsController],
  providers: [UserChatsService],
})
export class UserChatsModule {}
