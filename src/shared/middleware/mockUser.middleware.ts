import { NextFunction, Request, Response } from 'express';

const DEFAULT_USER_ID = process.env.MOCK_USER_ID ?? 'mock-user-001';

export const mockUser = (req: Request, _res: Response, next: NextFunction) => {
  const fromHeader = req.header('X-Mock-User-Id');
  const userId = fromHeader?.trim() || DEFAULT_USER_ID;

  req.user = { userId };
  next();
};
