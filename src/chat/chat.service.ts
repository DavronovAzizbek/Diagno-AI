import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { EditMessageDto } from './dto/edit-message.dto';
import { AddMessageDto } from './dto/add-message.dto';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
  ) {}

  async createChat(createChatDto: CreateChatDto): Promise<Chat> {
    const chat = this.chatRepository.create({
      ...createChatDto,
      content: [],
      isFavorite: createChatDto.isFavorite || false,
      createAt: new Date(),
      updateAt: new Date(),
    });
    return this.chatRepository.save(chat);
  }

  async addMessage(id: number, addMessageDto: AddMessageDto): Promise<Chat> {
    const chat = await this.chatRepository.findOne({ where: { id } });
    if (!chat) throw new NotFoundException('Chat not found');

    const messageId = `${Date.now()}-${Math.random()}`; // Xabar uchun noyob ID
    const newMessage = {
      id: messageId,
      ...addMessageDto,
      timestamp: new Date(),
    };

    chat.content.push(newMessage);
    return this.chatRepository.save(chat);
  }

  async getAllChats(isFavorite?: boolean): Promise<Chat[]> {
    const where = isFavorite !== undefined ? { isFavorite } : {};
    return this.chatRepository.find({ where });
  }

  async getChatById(id: number): Promise<Chat | null> {
    return this.chatRepository.findOne({ where: { id } });
  }

  async updateChat(id: number, updateChatDto: UpdateChatDto): Promise<Chat> {
    const chat = await this.getChatById(id);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    Object.assign(chat, updateChatDto, { updateAt: new Date() });
    return this.chatRepository.save(chat);
  }

  async editMessage(id: number, editMessageDto: EditMessageDto): Promise<Chat> {
    const chat = await this.chatRepository.findOne({ where: { id } });
    if (!chat) throw new NotFoundException('Chat not found');

    const message = chat.content.find(
      (msg) => msg.id === editMessageDto.messageId,
    );
    if (!message) throw new NotFoundException('Message not found');

    if (editMessageDto.newMessage) {
      message.message = editMessageDto.newMessage;
      message.editedAt = new Date(); // Tahrirlangan vaqtni saqlash
    }

    return this.chatRepository.save(chat);
  }

  async deleteChat(id: number): Promise<void> {
    const chat = await this.getChatById(id); // Chatni topish
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    await this.chatRepository.delete(id); // Chatni o'chirish
  }

  async deleteMessage(id: number, messageId: string): Promise<Chat> {
    const chat = await this.chatRepository.findOne({ where: { id } });
    if (!chat) throw new NotFoundException('Chat not found');

    const messageIndex = chat.content.findIndex((msg) => msg.id === messageId);
    if (messageIndex === -1) throw new NotFoundException('Message not found');

    chat.content.splice(messageIndex, 1); // Xabarni o'chirish
    return this.chatRepository.save(chat);
  }
}
