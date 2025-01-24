import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text', { array: true })
  specialty: string[];

  @Column({ nullable: true })
  profileImage: string;

  @Column({ nullable: true })
  contact1: string;

  @Column({ nullable: true })
  contact2: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  experience: string;

  @Column({ nullable: true })
  clinic: string;

  @Column()
  isFavorite: boolean;

  @Column({ nullable: true })
  description: string;

  @Column('text', { array: true })
  comment: string[];

  @Column('text', { array: true, nullable: true })
  languages: string[];

  @Column()
  gender: string;

  @Column('float')
  rating: number;

  @Column('int')
  reviews: number;
}
