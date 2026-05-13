import type { PrismaClient } from '../../generated/prisma/index.js';
import type { ITodoRepo } from './todo.repo.interface.js';
import type { CreateTodoDto, UpdateTodoDto } from './todo.schema.js';

export class TodoRepo implements ITodoRepo {
  constructor(private db: PrismaClient) {}

  findAll() {
    return this.db.todo.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findById(id: string) {
    return this.db.todo.findUnique({ where: { id } });
  }

  create(data: Pick<CreateTodoDto, 'title'>) {
    return this.db.todo.create({ data: { title: data.title } });
  }

  update(id: string, data: UpdateTodoDto) {
    return this.db.todo.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.db.todo.delete({ where: { id } });
  }

  count() {
    return this.db.todo.count();
  }

  countCompleted() {
    return this.db.todo.count({ where: { completed: true } });
  }
}
