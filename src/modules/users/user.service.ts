import bcrypt from 'bcryptjs';
import { ConflictError, NotFoundError, UnauthorizedError } from '../../shared/errors/AppError.js';
import type { IUserRepo } from './user.repo.interface.js';
import type { LoginDto, RegisterDto } from './user.schema.js';

const SALT_ROUNDS = 10;

function toPublicUser(user: { id: string; email: string }) {
  return { id: user.id, email: user.email };
}

export class UserService {
  constructor(private repo: IUserRepo) {}

  async register(payload: RegisterDto) {
    const existing = await this.repo.findByEmail(payload.email);
    if (existing) throw new ConflictError('Email already registered', 'EMAIL_TAKEN');

    const hashed = await bcrypt.hash(payload.password, SALT_ROUNDS);
    const user = await this.repo.create({ email: payload.email, password: hashed });

    return toPublicUser(user);
  }

  async login(payload: LoginDto) {
    const user = await this.repo.findByEmail(payload.email);
    if (!user) throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');

    const ok = await bcrypt.compare(payload.password, user.password);
    if (!ok) throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');

    return toPublicUser(user);
  }

  async getById(id: string) {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundError('User not found');

    return toPublicUser(user);
  }
}
