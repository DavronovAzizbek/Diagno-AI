import {
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserChatsService } from './user-chats.service';
import { Roles } from 'src/auth/role.guard';
import { RolesUserGuard } from 'src/auth/roleUserGuard';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('user/chats')
export class UserChatsController {
  constructor(private readonly userChatsService: UserChatsService) {}

  @UseGuards(AuthGuard, RolesUserGuard)
  @Roles('user')
  @Get()
  async getUserChats(@Query('userId') userId: number) {
    const chats = await this.userChatsService.getUserChats(userId);
    if (!chats || chats.length === 0) {
      return { message: 'No chats found for this user' }; // Xabar qo'shish
    }
    return { message: 'User chats retrieved successfully', data: chats };
  }

  @UseGuards(AuthGuard, RolesUserGuard)
  @Roles('user')
  @Post(':chatId/events')
  async addEventToChat(@Param('chatId') chatId: number, @Body() event: any) {
    const eventAdded = await this.userChatsService.addEventToChat(
      chatId,
      event,
    );
    return { message: 'Event added to chat successfully', data: eventAdded };
  }

  @UseGuards(AuthGuard, RolesUserGuard)
  @Roles('user')
  @Patch(':chatId/favorite')
  async toggleFavorite(
    @Param('chatId') chatId: number,
    @Body('isFavorite') isFavorite: boolean,
  ) {
    const updatedChat = await this.userChatsService.toggleFavorite(
      chatId,
      isFavorite,
    );
    return { message: 'Chat favorite status updated', data: updatedChat };
  }

  @UseGuards(AuthGuard, RolesUserGuard)
  @Roles('user')
  @Patch(':chatId/events/:eventIndex')
  async updateEvent(
    @Param('chatId') chatId: number,
    @Param('eventIndex') eventIndex: number,
    @Body() updatedEvent: any,
  ) {
    const updatedEventResult = await this.userChatsService.updateEvent(
      chatId,
      eventIndex,
      updatedEvent,
    );
    return { message: 'Event updated successfully', data: updatedEventResult };
  }

  @UseGuards(AuthGuard, RolesUserGuard)
  @Roles('user')
  @Delete(':chatId/events/:eventIndex')
  async deleteEvent(
    @Param('chatId') chatId: number,
    @Param('eventIndex') eventIndex: number,
  ) {
    const result = await this.userChatsService.deleteEvent(chatId, eventIndex);
    return { message: 'Event deleted successfully', data: result };
  }
}
