import { NotFoundError } from '../../shared/errors/AppError.js';
import type { ITodoRepo } from './todo.repo.interface.js';
import type { CreateTodoDto, UpdateTodoDto } from './todo.schema.js';

export class TodoService {
  constructor(private repo: ITodoRepo) {}

  async getAll() {
    return this.repo.findAll();
  }

  async getStats() {
    const [totalTodos, completedTodos] = await Promise.all([
      this.repo.count(),
      this.repo.countCompleted(),
    ]);

    const completionRate = totalTodos === 0 ? 0 : completedTodos / totalTodos;

    return { totalTodos, completedTodos, completionRate };
  }



  async create(payload: CreateTodoDto) {
    return this.repo.create({ title: payload.title });
  }

  async update(id: string, payload: UpdateTodoDto) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundError('Todo not found');

    return this.repo.update(id, payload);
  }

  async delete(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundError('Todo not found');

    await this.repo.delete(id);
  }
}
