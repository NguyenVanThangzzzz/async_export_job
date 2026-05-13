import type { PrismaClient } from '../../generated/prisma/index.js';
import type { CreateUserData, IUserRepo } from './user.repo.interface.js';

export class UserRepo implements IUserRepo {
  constructor(private db: PrismaClient) {}

  findByEmail(email: string) {
    return this.db.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.db.user.findUnique({ where: { id } });
  }

  create(data: CreateUserData) {
    return this.db.user.create({ data });
  }
}
