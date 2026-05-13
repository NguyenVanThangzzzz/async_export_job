import type { User } from '../../generated/prisma/index.js';

export type CreateUserData = { email: string; password: string };

export interface IUserRepo {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
}
