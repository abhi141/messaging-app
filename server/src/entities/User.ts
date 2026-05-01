import 'reflect-metadata';
import {
  Entity,
  ObjectIdColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('users')
export class User {
  @ObjectIdColumn()
  _id!: ObjectId;

  @Column({ unique: true })
  username!: string;

  @Column()
  passwordHash!: string;

  @Column({ nullable: true })
  displayName?: string;

  @Column({ nullable: true })
  bio?: string;

  @Column({ nullable: true })
  avatarBase64?: string;

  @Column({ nullable: true })
  avatarMimeType?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
