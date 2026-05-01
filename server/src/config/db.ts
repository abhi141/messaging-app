import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Message } from '../entities/Message';
import { env } from './env';

export const AppDataSource = new DataSource({
  type: 'mongodb',
  url: env.MONGODB_URI,
  synchronize: true,
  logging: env.NODE_ENV === 'development',
  entities: [User, Message],
});
