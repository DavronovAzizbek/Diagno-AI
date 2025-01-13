import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { EditMessageDto } from './dto/edit-message.dto';
import { AddMessageDto } from './dto/add-message.dto';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ChatsService {
  chatsService: any;
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getChatById(id: number): Promise<Chat> {
    const chat = await this.chatRepository.findOne({ where: { id } });
    if (!chat) {
      throw new NotFoundException(`Chat with ID ${id} not found`);
    }
    return chat;
  }

  async createChat(createChatDto: CreateChatDto): Promise<Chat> {
    const chat = this.chatRepository.create({
      ...createChatDto,
      userId: createChatDto.userId,
      content: [],
      isFavorite: createChatDto.isFavorite || false,
    });
    return this.chatRepository.save(chat);
  }

  async addMessage(id: number, addMessageDto: AddMessageDto): Promise<Chat> {
    const chat = await this.getChatById(id);
    if (!chat) throw new NotFoundException('Chat not found');

    const messageId = `${Date.now()}-${Math.random()}`;
    const newMessage = {
      id: messageId,
      ...addMessageDto,
      timestamp: new Date(),
      editedAt: undefined,
    };

    chat.content.push(newMessage);
    return this.chatRepository.save(chat);
  }

  async getAllChats(isFavorite?: boolean): Promise<Chat[]> {
    const where = isFavorite !== undefined ? { isFavorite } : {};
    return this.chatRepository.find({ where });
  }

  async getChatsByUserId(userId: number): Promise<Chat[]> {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new BadRequestException('User ID must be a positive integer');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const chats = await this.chatRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    chats.forEach((chat) => {
      if (chat.user) {
        delete chat.user.password;
        delete chat.user.role;
        delete chat.user.refreshToken;
      }
    });

    return chats;
  }

  async updateChat(id: number, updateChatDto: UpdateChatDto): Promise<Chat> {
    const chat = await this.getChatById(id);
    Object.assign(chat, updateChatDto, { updateAt: new Date() });
    return this.chatRepository.save(chat);
  }

  async editMessage(id: number, editMessageDto: EditMessageDto): Promise<Chat> {
    const chat = await this.getChatById(id);
    const message = chat.content.find(
      (msg) => msg.id === editMessageDto.messageId,
    );

    if (!message) throw new NotFoundException('Message not found');

    if (editMessageDto.newMessage) {
      message.message = editMessageDto.newMessage;
      message.editedAt = new Date();
    }

    return this.chatRepository.save(chat);
  }

  async toggleFavorite(id: number): Promise<Chat> {
    const chat = await this.getChatById(id);
    chat.isFavorite = !chat.isFavorite;
    chat.updatedAt = new Date();
    return this.chatRepository.save(chat);
  }

  async deleteChat(id: number): Promise<void> {
    const chat = await this.getChatById(id);
    await this.chatRepository.delete(chat.id);
  }

  async deleteMessage(id: number, messageId: string): Promise<Chat> {
    const chat = await this.getChatById(id);
    const messageIndex = chat.content.findIndex((msg) => msg.id === messageId);
    if (messageIndex === -1) throw new NotFoundException('Message not found');

    chat.content.splice(messageIndex, 1);
    return this.chatRepository.save(chat);
  }
}
