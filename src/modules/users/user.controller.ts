import type { Request, Response } from 'express';
import type { LoginDto, RegisterDto } from './user.schema.js';
import type { UserService } from './user.service.js';

export class UserController {
  constructor(private service: UserService) {}

  async register(req: Request, res: Response) {
    const body = req.body as RegisterDto;
    const user = await this.service.register(body);

    res.locals.resource = user;
    res.status(201).json(user);
  }

  async login(req: Request, res: Response) {
    const body = req.body as LoginDto;
    const user = await this.service.login(body);

    res.status(200).json({ message: 'Login successful', user });
  }

  async getById(req: Request, res: Response) {
    const { id } = res.locals.params as { id: string };
    const user = await this.service.getById(id);

    res.status(200).json(user);
  }
}
