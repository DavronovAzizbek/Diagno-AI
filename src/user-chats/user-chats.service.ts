import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from 'src/chat/entities/chat.entity';

@Injectable()
export class UserChatsService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
  ) {}

  // Foydalanuvchining barcha chatlarini olish
  async getUserChats(userId: number): Promise<Chat[]> {
    // Userni Chatda ishlatish uchun, ManyToOne munosabati asosida filter ishlatish
    return this.chatRepository.find({ where: { user: { id: userId } } });
  }

  // Chatga yangi voqea qo'shish
  async addEventToChat(chatId: number, event: any): Promise<Chat> {
    const chat = await this.chatRepository.findOne({ where: { id: chatId } });

    if (!chat) {
      throw new NotFoundException(`Chat with ID ${chatId} not found`);
    }

    chat.content = [...chat.content, event];
    chat.updateAt = new Date();
    return this.chatRepository.save(chat);
  }

  // Chatni sevimli deb belgilash yoki belgini olib tashlash
  async toggleFavorite(chatId: number, isFavorite: boolean): Promise<Chat> {
    const chat = await this.chatRepository.findOne({ where: { id: chatId } });

    if (!chat) {
      throw new NotFoundException(`Chat with ID ${chatId} not found`);
    }

    chat.isFavorite = isFavorite;
    chat.updateAt = new Date();
    return this.chatRepository.save(chat);
  }

  // Chat voqeasini tahrirlash
  async updateEvent(
    chatId: number,
    eventIndex: number,
    updatedEvent: any,
  ): Promise<Chat> {
    const chat = await this.chatRepository.findOne({ where: { id: chatId } });

    if (!chat) {
      throw new NotFoundException(`Chat with ID ${chatId} not found`);
    }

    if (!chat.content[eventIndex]) {
      throw new NotFoundException(
        `Event at index ${eventIndex} not found in chat ${chatId}`,
      );
    }

    chat.content[eventIndex] = updatedEvent;
    chat.updateAt = new Date();
    return this.chatRepository.save(chat);
  }

  // Chat voqeasini o'chirish
  async deleteEvent(chatId: number, eventIndex: number): Promise<Chat> {
    const chat = await this.chatRepository.findOne({ where: { id: chatId } });

    if (!chat) {
      throw new NotFoundException(`Chat with ID ${chatId} not found`);
    }

    if (!chat.content[eventIndex]) {
      throw new NotFoundException(
        `Event at index ${eventIndex} not found in chat ${chatId}`,
      );
    }

    chat.content.splice(eventIndex, 1);
    chat.updateAt = new Date();
    return this.chatRepository.save(chat);
  }
}
