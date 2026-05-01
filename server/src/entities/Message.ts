import 'reflect-metadata';
import { Entity, ObjectIdColumn, Column, CreateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('messages')
export class Message {
  @ObjectIdColumn()
  _id!: ObjectId;

  @Column()
  conversationId!: string;

  @Column()
  senderId!: string;

  @Column()
  receiverId!: string;

  @Column()
  content!: string;

  @Column({ array: true })
  readBy!: string[];

  @CreateDateColumn()
  sentAt!: Date;
}
