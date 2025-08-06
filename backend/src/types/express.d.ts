import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: any;
      file?: any;
      files?: any;
      params?: any;
      body?: any;
      query?: any;
    }
  }
}

export interface AuthRequest extends Request {
  userId?: string;
  params?: any;
}