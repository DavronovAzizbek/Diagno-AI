import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity'; // Foydalanuvchi entiti

@Entity()
export class UserChat {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.chats)
  user: User; // Foydalanuvchi, ular bilan bog'lanadi

  @Column({ default: false })
  isFavorite: boolean; // Chatni sevimli deb belgilash

  @CreateDateColumn()
  createdAt: Date; // Yaratilgan vaqt

  @UpdateDateColumn()
  updatedAt: Date; // Oxirgi yangilanish vaqti
}
