import { User } from 'src/auth/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: false })
  isFavorite: boolean;

  // JSON formatida kontent saqlash
  @Column({ type: 'simple-json', default: [] })
  content: {
    id: string;
    message: string;
    author: string;
    timestamp: Date;
    editedAt?: Date;
  }[];

  @Column()
  userId: number; // Foydalanuvchi bilan bog'liq xususiyat

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.chats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
  page: any;
}
