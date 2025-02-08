import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  Delete,
  UseGuards,
  BadRequestException,
  InternalServerErrorException,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ChatsService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { EditMessageDto } from './dto/edit-message.dto';
import { AddMessageDto } from './dto/add-message.dto';
import { AuthRolesGuard } from 'src/auth/authRoles.guard';
import { Roles } from 'src/auth/roleAdmin.guard';
import { RolesUserGuard } from 'src/auth/roleUserGuard';
import { CreateRequestDto } from './dto/create-request.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs/promises';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @UseGuards(RolesUserGuard)
  @Roles('user')
  @Post('request')
  async sendRequest(@Body() createRequestDto: CreateRequestDto) {
    try {
      const response =
        await this.chatsService.handleUserRequest(createRequestDto);
      return response.message;
    } catch (error) {
      console.error('Error processing request:', error);
      throw new InternalServerErrorException('Failed to process request');
    }
  }

  @UseGuards(RolesUserGuard)
  @Roles('user')
  @Post('voice')
  @UseInterceptors(
    FileInterceptor('audio', {
      storage: diskStorage({
        destination: './uploads/audio',
        filename: (req, file, callback) => {
          const filename = `${Date.now()}${path.extname(file.originalname)}`;
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith('audio/')) {
          return callback(new BadRequestException('Invalid audio file'), false);
        }
        callback(null, true);
      },
    }),
  )
  async handleVoiceUpload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No audio file uploaded');
    }

    const textResponse = this.chatsService.processAudioFile();

    return textResponse;
  }

  @UseGuards(RolesUserGuard)
  @Roles('user')
  @Post('file-request')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: async (req, file, callback) => {
          const today = new Date().toISOString().split('T')[0];
          const uploadPath = `./uploads/${today}`;

          try {
            await fs.mkdir(uploadPath, { recursive: true });
            callback(null, uploadPath);
          } catch (err) {
            callback(err, uploadPath);
          }
        },
        filename: (req, file, callback) => {
          const filename = `${Date.now()}${path.extname(file.originalname)}`;
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (file.mimetype !== 'text/plain') {
          return callback(
            new BadRequestException('Only .txt files are allowed'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async handleFileUpload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      const response = await this.chatsService.processFile(file.path);
      return response;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new InternalServerErrorException('Failed to process file');
    }
  }

  @UseGuards(AuthRolesGuard)
  @Roles('user', 'admin')
  @Post()
  async createChat(@Body() createChatDto: CreateChatDto, @Req() req) {
    const userId = req.user.userId;

    if (!userId) {
      throw new Error('User ID not found');
    }

    createChatDto.userId = userId;

    const newChat = await this.chatsService.createChat(createChatDto);
    return { message: 'Chat created successfully', data: newChat };
  }

  @UseGuards(RolesUserGuard)
  @Roles('user')
  @Post(':id/messages')
  async addMessage(
    @Param('id') id: number,
    @Body() addMessageDto: AddMessageDto,
  ) {
    try {
      const updatedChat = await this.chatsService.addMessage(id, addMessageDto);
      return { message: 'Message added successfully', data: updatedChat };
    } catch (error) {
      console.error('Error adding message:', error);
      throw new InternalServerErrorException('Failed to add message');
    }
  }

  @UseGuards(AuthRolesGuard)
  @Roles('user', 'admin')
  @Get()
  async getAllChats(@Query('isFavorite') isFavorite?: string) {
    try {
      const isFavoriteFilter = isFavorite ? isFavorite === 'true' : undefined;
      const chats = await this.chatsService.getAllChats(isFavoriteFilter);
      return { message: 'Chats retrieved successfully', data: chats };
    } catch (error) {
      console.error('Error retrieving all chats:', error);
      throw new InternalServerErrorException('Failed to retrieve chats');
    }
  }

  @UseGuards(RolesUserGuard)
  @Roles('user')
  @Get('/my-chats')
  async getMyChats(@Query('userId') userId: string) {
    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId) || parsedUserId <= 0) {
      throw new BadRequestException('Invalid userId');
    }

    const chats = await this.chatsService.getChatsByUserId(parsedUserId);

    const sanitizedChats = chats.map((chat) => {
      if (chat.user) {
        delete chat.user.password;
        delete chat.user.role;
        delete chat.user.refreshToken;
      }
      return chat;
    });

    return {
      message: 'User chats retrieved successfully',
      data: sanitizedChats,
    };
  }

  @UseGuards(RolesUserGuard)
  @Roles('user')
  @Get(':id')
  async getChatById(@Param('id') id: number) {
    try {
      const chat = await this.chatsService.getChatById(id);
      return { message: 'Chat retrieved successfully', data: chat };
    } catch (error) {
      console.error('Error retrieving chat by ID:', error);
      throw new InternalServerErrorException('Failed to retrieve chat');
    }
  }

  @UseGuards(AuthRolesGuard)
  @Roles('user', 'admin')
  @Patch(':id')
  async updateChat(
    @Param('id') id: number,
    @Body() updateChatDto: UpdateChatDto,
  ) {
    try {
      const updatedChat = await this.chatsService.updateChat(id, updateChatDto);
      return { message: 'Chat updated successfully', data: updatedChat };
    } catch (error) {
      console.error('Error updating chat:', error);
      throw new InternalServerErrorException('Failed to update chat');
    }
  }

  @UseGuards(RolesUserGuard)
  @Roles('user')
  @Patch(':id/messages')
  async editMessage(
    @Param('id') id: number,
    @Body() editMessageDto: EditMessageDto,
  ) {
    try {
      const updatedChat = await this.chatsService.editMessage(
        id,
        editMessageDto,
      );
      return { message: 'Message edited successfully', data: updatedChat };
    } catch (error) {
      console.error('Error editing message:', error);
      throw new InternalServerErrorException('Failed to edit message');
    }
  }

  @UseGuards(RolesUserGuard)
  @Roles('user')
  @Patch(':id/favorite')
  async toggleFavorite(@Param('id') id: number) {
    try {
      const updatedChat = await this.chatsService.toggleFavorite(id);
      return {
        message: 'Chat favorite status updated successfully',
        data: updatedChat,
      };
    } catch (error) {
      console.error('Error toggling favorite status:', error);
      throw new InternalServerErrorException(
        'Failed to toggle favorite status',
      );
    }
  }

  @UseGuards(AuthRolesGuard)
  @Roles('user', 'admin')
  @Delete(':id')
  async deleteChat(@Param('id') id: number) {
    try {
      await this.chatsService.deleteChat(id);
      return { message: 'Chat deleted successfully' };
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw new InternalServerErrorException('Failed to delete chat');
    }
  }

  @UseGuards(RolesUserGuard)
  @Roles('user')
  @Delete(':id/messages/:messageId')
  async deleteMessage(
    @Param('id') id: number,
    @Param('messageId') messageId: string,
  ) {
    try {
      const updatedChat = await this.chatsService.deleteMessage(id, messageId);
      return { message: 'Message deleted successfully', data: updatedChat };
    } catch (error) {
      console.error('Error deleting message:', error);
      throw new InternalServerErrorException('Failed to delete message');
    }
  }
}
