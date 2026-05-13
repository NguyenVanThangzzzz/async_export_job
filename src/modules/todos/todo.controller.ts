import type { Request, Response } from 'express';
import { memDel } from '../../shared/cache/memCache.js';
import type { CreateTodoDto, TodoIdParamsDto, UpdateTodoDto } from './todo.schema.js';
import type { TodoService } from './todo.service.js';

export class TodoController {
  constructor(private service: TodoService) {}

  async getAll(_req: Request, res: Response) {
    const todos = await this.service.getAll();
    res.status(200).json(todos);
  }

  async getStats(_req: Request, res: Response) {
    const stats = await this.service.getStats();
    return res.status(200).json(stats);
  }

  async create(req: Request, res: Response) {
    const body = req.body as CreateTodoDto;
    const todo = await this.service.create(body);

    memDel('todos');
    memDel('stats');

    res.status(201).json(todo);
  }

  async update(req: Request, res: Response) {
    const { id } = res.locals.params as TodoIdParamsDto;
    const body = req.body as UpdateTodoDto;
    const todo = await this.service.update(id, body);

    memDel('todos');
    memDel('stats');

    res.status(200).json(todo);
  }

  async delete(_req: Request, res: Response) {
    const { id } = res.locals.params as TodoIdParamsDto;
    await this.service.delete(id);

    memDel('todos');
    memDel('stats');

    res.status(204).send();
  }
}
