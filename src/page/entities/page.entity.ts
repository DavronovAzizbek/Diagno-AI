import { Chat } from 'src/chat/entities/chat.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('pages')
export class Page {
  @PrimaryGeneratedColumn()
  id: number;
  slug: string;

  constructor() {
    this.slug = uuidv4();
  }

  @Column()
  name: string;

  @Column()
  path: string;

  @Column({ type: 'json', nullable: true })
  content: any; // JSON format uchun

  @Column({ default: false })
  isFavorite: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Chat, (chat) => chat.page)
  chats: Chat[];
}
