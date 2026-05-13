import type { Todo } from '../../generated/prisma/index.js';
import type { CreateTodoDto, UpdateTodoDto } from './todo.schema.js';

export interface ITodoRepo {
  findAll(): Promise<Todo[]>;
  findById(id: string): Promise<Todo | null>;
  create(data: Pick<CreateTodoDto, 'title'>): Promise<Todo>;
  update(id: string, data: UpdateTodoDto): Promise<Todo>;
  delete(id: string): Promise<void>;
  count(): Promise<number>;
  countCompleted(): Promise<number>;
}
