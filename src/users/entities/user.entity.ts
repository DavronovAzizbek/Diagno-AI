import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 50, default: 'user' })
  role: string;
  chats: any;

  @BeforeInsert()
  hashPassword() {
    // Parolni xesh qilishni unutmaslik kerak. Misol uchun bcrypt.js ishlatish mumkin.
    // this.password = bcrypt.hashSync(this.password, 10); // Agar kerak bo'lsa
  }
}
