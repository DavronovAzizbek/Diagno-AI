import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ChatsService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Roles, RolesGuard } from 'src/auth/role.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import { EditMessageDto } from './dto/edit-message.dto';
import { AddMessageDto } from './dto/add-message.dto';

@Controller('chats')
export class ChatsController {
  chatModel: any;
  constructor(private readonly chatsService: ChatsService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async createChat(@Body() createChatDto: CreateChatDto) {
    const newChat = await this.chatsService.createChat(createChatDto);
    return { message: 'Chat created successfully', data: newChat };
  }

  @Post(':id/messages')
  addMessage(@Param('id') id: number, @Body() addMessageDto: AddMessageDto) {
    return this.chatsService.addMessage(id, addMessageDto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  async getAllChats(@Query('isFavorite') isFavorite?: string) {
    const isFavoriteFilter = isFavorite ? isFavorite === 'true' : undefined;
    const chats = await this.chatsService.getAllChats(isFavoriteFilter);
    if (!chats || chats.length === 0) {
      return { message: 'No chats found' };
    }
    return { message: 'Chats retrieved successfully', data: chats };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  async getChatById(@Param('id') id: number) {
    const chat = await this.chatsService.getChatById(id);
    if (!chat) {
      throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
    }
    return { message: 'Chat retrieved successfully', data: chat };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  async updateChat(
    @Param('id') id: number,
    @Body() updateChatDto: UpdateChatDto,
  ) {
    const updatedChat = await this.chatsService.updateChat(id, updateChatDto);
    if (!updatedChat) {
      return { message: 'Chat not found or update failed' };
    }
    return { message: 'Chat updated successfully', data: updatedChat };
  }

  @Patch(':id/messages')
  editMessage(@Param('id') id: number, @Body() editMessageDto: EditMessageDto) {
    return this.chatsService.editMessage(id, editMessageDto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async deleteChat(@Param('id') id: number) {
    try {
      await this.chatsService.deleteChat(id);
      return { message: 'Chat deleted successfully' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Delete(':id/messages/:messageId')
  deleteMessage(
    @Param('id') id: number,
    @Param('messageId') messageId: string,
  ) {
    return this.chatsService.deleteMessage(id, messageId);
  }
}
