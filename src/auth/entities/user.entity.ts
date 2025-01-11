import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 2500, unique: true })
  email: string;

  @Column()
  password: string; // Parol maydoni

  @Column({ nullable: true })
  refreshToken: string; // Refresh token maydoni

  @Column({ type: 'enum', enum: Role })
  role: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  verificationCode: any;
  verificationCodeExpiresAt: Date;
  chats: any;
}
